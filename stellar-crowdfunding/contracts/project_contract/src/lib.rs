#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, token, Address, 
    symbol_short, Env, Map, Symbol, contracterror, String, panic_with_error,
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
    DeadlineNotReached = 1,
    NotAuthorized = 2,
    DeadlineReached = 3,
}

#[contract]
pub struct CrowdfundingProject;

// Storage keys
const PROJECT_DATA: Symbol = symbol_short!("proj_data");
const TOTAL_FUNDED: Symbol = symbol_short!("total");
const CONTRIBUTIONS: Symbol = symbol_short!("contrib");
const TOKEN_ID: Symbol = symbol_short!("token_id");

#[contractimpl]
impl CrowdfundingProject {
    // Initialize the project contract
    pub fn init(
        env: Env,
        title: String,
        description: String,
        image_url: String,
        creator: Address,
        deadline: i128,
    ) {
        // Store project data
        let project_data = ProjectData {
            title,
            description,
            image_url,
            creator,
            deadline: deadline as u64,
        };
        env.storage().instance().set(&PROJECT_DATA, &project_data);
        
        // Initialize contributions map and total funded
        env.storage().instance().set(&CONTRIBUTIONS, &Map::<Address, i128>::new(&env));
        env.storage().instance().set(&TOTAL_FUNDED, &0_i128);
    }

    // Set the token to be used for funding (typically a stablecoin)
    pub fn set_token(env: Env, token_id: Address) {
        let project_data: ProjectData = env.storage().instance().get(&PROJECT_DATA).unwrap();
        project_data.creator.require_auth();
        
        env.storage().instance().set(&TOKEN_ID, &token_id);
    }

    // Fund the project
    pub fn fund(env: Env, from: Address, amount: i128) {
        from.require_auth();
        
        // Check if deadline has been reached
        let project_data: ProjectData = env.storage().instance().get(&PROJECT_DATA).unwrap();
        if env.ledger().timestamp() > project_data.deadline {
            panic_with_error!(&env, Error::DeadlineReached);
        }
        
        // Get the token ID
        let token_id: Address = env.storage().instance().get(&TOKEN_ID).unwrap();
        
        // Transfer tokens from the funder to this contract
        let token_client = token::Client::new(&env, &token_id);
        token_client.transfer(&from, &env.current_contract_address(), &amount);
        
        // Update the contribution record
        let mut contributions: Map<Address, i128> = env.storage().instance().get(&CONTRIBUTIONS).unwrap();
        let current_contribution = contributions.get(from.clone()).unwrap_or(0);
        contributions.set(from.clone(), current_contribution + amount);
        env.storage().instance().set(&CONTRIBUTIONS, &contributions);
        
        // Update total funded
        let total_funded: i128 = env.storage().instance().get(&TOTAL_FUNDED).unwrap();
        env.storage().instance().set(&TOTAL_FUNDED, &(total_funded + amount));
    }

    // Withdraw funds after deadline
    pub fn withdraw(env: Env) {
        // Get project data
        let project_data: ProjectData = env.storage().instance().get(&PROJECT_DATA).unwrap();
        
        // Only creator can withdraw
        project_data.creator.require_auth();
        
        // Check if deadline has been reached
        if env.ledger().timestamp() <= project_data.deadline {
            panic_with_error!(&env, Error::DeadlineNotReached);
        }
        
        // Get total funded amount
        let total_funded: i128 = env.storage().instance().get(&TOTAL_FUNDED).unwrap();
        
        // If there are funds to withdraw
        if total_funded > 0 {
            // Get token ID and create client
            let token_id: Address = env.storage().instance().get(&TOKEN_ID).unwrap();
            let token_client = token::Client::new(&env, &token_id);
            
            // Transfer all funds to the creator
            token_client.transfer(
                &env.current_contract_address(),
                &project_data.creator,
                &total_funded,
            );
            
            // Reset total funded to 0
            env.storage().instance().set(&TOTAL_FUNDED, &0_i128);
        }
    }
    
    // Get the project data
    pub fn get_project_data(env: Env) -> ProjectData {
        env.storage().instance().get(&PROJECT_DATA).unwrap()
    }
    
    // Get the total funded amount
    pub fn get_total_funded(env: Env) -> i128 {
        env.storage().instance().get(&TOTAL_FUNDED).unwrap()
    }
    
    // Get contribution from a specific funder
    pub fn get_contribution(env: Env, funder: Address) -> i128 {
        let contributions: Map<Address, i128> = env.storage().instance().get(&CONTRIBUTIONS).unwrap();
        contributions.get(funder).unwrap_or(0)
    }
    
    // Get all contributions
    pub fn get_all_contributions(env: Env) -> Map<Address, i128> {
        env.storage().instance().get(&CONTRIBUTIONS).unwrap()
    }
    
    // Get token being used for funding
    pub fn get_token(env: Env) -> Option<Address> {
        env.storage().instance().get(&TOKEN_ID)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env, IntoVal};
    
    fn create_token_contract(e: &Env) -> Address {
        let addr = Address::generate(e);
        e.register_stellar_asset_contract(addr)
    }
    
    fn create_project_data(e: &Env) -> ProjectData {
        let creator = Address::generate(e);
        ProjectData {
            title: "Test Project".into_val(e),
            description: "Test Description".into_val(e),
            image_url: "https://example.com/image.jpg".into_val(e),
            creator,
            deadline: e.ledger().timestamp() + 86400, // 1 day in the future
        }
    }
    
    #[test]
    fn test_initialize() {
        let env = Env::default();
        let project_data = create_project_data(&env);
        
        let contract_id = env.register_contract(None, CrowdfundingProject);
        let client = CrowdfundingProjectClient::new(&env, &contract_id);
        
        client.initialize(&project_data);
        
        let retrieved_data = client.get_project_data();
        assert_eq!(retrieved_data, project_data);
        assert_eq!(client.get_total_funded(), 0);
    }
    
    #[test]
    fn test_contribute_and_withdraw() {
        let env = Env::default();
        
        // Set up accounts
        let creator = Address::generate(&env);
        let contributor = Address::generate(&env);
        
        // Set up token contract
        let token = create_token_contract(&env);
        
        // Create project data
        let mut project_data = create_project_data(&env);
        project_data.creator = creator.clone();
        
        // Set up contract
        let contract_id = env.register_contract(None, CrowdfundingProject);
        let client = CrowdfundingProjectClient::new(&env, &contract_id);
        
        // Initialize contract
        client.initialize(&project_data);
        
        // Mint tokens to contributor
        let token_client = token::Client::new(&env, &token);
        token_client.mint(&contributor, &1000);
        
        // Contribute to project
        env.set_auth_context(contributor.clone(), vec![&env, (&contract_id, symbol_short!("contribute"), token.clone(), 500i128).into_val(&env)]);
        client.contribute(&token, &500);
        
        // Check total funded
        assert_eq!(client.get_total_funded(), 500);
        
        // Check contributor's contribution
        assert_eq!(client.get_contribution(&contributor), 500);
        
        // Try to withdraw before deadline (should fail)
        env.set_auth_context(creator.clone(), vec![&env, (&contract_id, symbol_short!("withdraw")).into_val(&env)]);
        let result = std::panic::catch_unwind(|| {
            client.withdraw();
        });
        assert!(result.is_err());
        
        // Advance time past deadline
        env.ledger().set_timestamp(project_data.deadline + 1);
        
        // Withdraw funds
        env.set_auth_context(creator.clone(), vec![&env, (&contract_id, symbol_short!("withdraw")).into_val(&env)]);
        client.withdraw();
        
        // Check total funded is reset
        assert_eq!(client.get_total_funded(), 0);
        
        // Check creator balance
        assert_eq!(token_client.balance(&creator), 500);
    }
} 