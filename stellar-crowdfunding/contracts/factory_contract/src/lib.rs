#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, Address, BytesN, Env, Symbol, Vec, symbol_short, 
    String, contracterror, panic_with_error, xdr::ToXdr, Val, IntoVal,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ProjectData {
    pub title: String,
    pub description: String,
    pub image_url: String,
    pub creator: Address,
    pub deadline: u64,  // Unix timestamp for the funding deadline
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotAuthorized = 1,
    ProjectWasmHashNotSet = 2,
}

#[contract]
pub struct CrowdfundingFactory;

// Admin key for authorization
const ADMIN: Symbol = symbol_short!("admin");
// WASM hash for the project contract
const PROJECT_WASM_HASH: Symbol = symbol_short!("wasm");
// List of deployed projects
const PROJECTS: Symbol = symbol_short!("projects");

#[contractimpl]
impl CrowdfundingFactory {
    // Initialize the factory with an admin address
    pub fn initialize(env: Env, admin: Address) {
        env.storage().instance().set(&ADMIN, &admin);
        let empty_vec: Vec<Address> = Vec::new(&env);
        env.storage().instance().set(&PROJECTS, &empty_vec);
    }

    // Set the WASM hash of the project contract
    pub fn set_project_wasm_hash(env: Env, admin: Address, wasm_hash: BytesN<32>) {
        // Check if caller is admin
        let stored_admin: Address = env.storage().instance().get(&ADMIN).unwrap();
        if stored_admin != admin {
            panic_with_error!(&env, Error::NotAuthorized);
        }
        env.storage().instance().set(&PROJECT_WASM_HASH, &wasm_hash);
    }

    // Create a new project contract
    pub fn create_project(
        env: Env,
        creator: Address,
        title: String,
        description: String,
        image_url: String,
        deadline: u64,
    ) -> Address {
        // Verify creator is the caller
        creator.require_auth();

        // Get the project contract WASM hash
        let wasm_hash: BytesN<32> = match env.storage().instance().get(&PROJECT_WASM_HASH) {
            Some(hash) => hash,
            None => panic_with_error!(&env, Error::ProjectWasmHashNotSet),
        };

        // Create project data
        let project_data = ProjectData {
            title,
            description,
            image_url,
            creator: creator.clone(),
            deadline,
        };

        // Deploy a new instance of the project contract
        let salt = env.crypto().sha256(&creator.to_xdr(&env));
        let project_contract_id = env.deployer().with_current_contract(salt).deploy(wasm_hash);

        // Initialize the project contract with the project data
        let init_fn = symbol_short!("init");
        let mut args = Vec::<Val>::new(&env);
        args.push_back(project_data.title.into_val(&env));
        args.push_back(project_data.description.into_val(&env));
        args.push_back(project_data.image_url.into_val(&env));
        args.push_back(project_data.creator.into_val(&env));
        args.push_back((project_data.deadline as i128).into_val(&env));
        env.invoke_contract::<()>(&project_contract_id, &init_fn, args);

        // Add the project contract address to our list
        let mut projects: Vec<Address> = env.storage().instance().get(&PROJECTS).unwrap();
        projects.push_back(project_contract_id.clone());
        env.storage().instance().set(&PROJECTS, &projects);

        // Return the new project contract address
        project_contract_id
    }

    // Get all deployed projects
    pub fn get_projects(env: Env) -> Vec<Address> {
        env.storage().instance().get(&PROJECTS).unwrap_or(Vec::new(&env))
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};
    
    #[test]
    fn test_initialize() {
        let env = Env::default();
        let admin = Address::generate(&env);
        
        let contract_id = env.register_contract(None, CrowdfundingFactory);
        let client = CrowdfundingFactoryClient::new(&env, &contract_id);
        
        client.initialize(&admin);
        
        assert_eq!(client.get_projects(), Vec::<Address>::new(&env));
    }
} 