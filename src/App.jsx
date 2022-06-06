import React, { useEffect, useState } from 'react';
import './Styles/app.css';
import { ethers } from 'ethers'; // The best web3 library (IMO 😊)


const App = () => {
  // The main component for the web app

  // This state gets the wallet address of the user 
  const [walletAddress, setWalletAddress] = useState(null);

  // Checks if the user via the wallet address is registered
  const [registered, setRegistry] = useState(false);

  // Gets the registry details to be sent to the voting contract
  const [textDetails, setTextDetails] = useState({firstName: '', lastName: '', age: 0});

  // Checks if the user has voted for any candidate of choice
  const [voted, setVoted] = useState(false);
  
  // Stores the number of votes each candidate have gotten in an object (currently in a null state)
  const [voteCount, setVoteCount] = useState(null);

  // The abi (Application Binary Interface) of the main voting system contract
  const abi = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "string",
                "name": "first_name",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "last_name",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "age",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "date_registered",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "address_",
                "type": "address"
            }
        ],
        "name": "Registry",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "voter",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "candidate",
                "type": "string"
            }
        ],
        "name": "Voting",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "name": "candidates",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getVoterDetails",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "string",
                        "name": "first_name",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "last_name",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "age",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "date_registered",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "address_",
                        "type": "address"
                    }
                ],
                "internalType": "struct Vote.Details[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "first_name_",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "last_name_",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "age_",
                "type": "uint256"
            }
        ],
        "name": "register",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "full_name",
                "type": "string"
            }
        ],
        "name": "registerCandidate",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "registered",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "candidate",
                "type": "string"
            }
        ],
        "name": "vote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "voted",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
  ]

  useEffect(() => {
    const getWallet = async () => {
      // This function attempts to obtain the wallet address of the user
      
      // Getting the ethereum object from window
      const { ethereum } = window; 

      
      if (ethereum) { 
        // Checks if an ethereum object (preferably seen as a wallet) is detected
        
        // Requests to get a set off ethereum accounts (or wallet addresses)
        const walletAddresses = await ethereum.request({method: 'eth_requestAccounts'});
        
        // The main address connected to the user
        const mainAddress = walletAddresses[0];
        
        
        // Sets the response address to the wallet address state
        setWalletAddress(mainAddress)
        

        // Checking if the wallet address response wasn't empty
        if (walletAddress !== null && walletAddress !== undefined) {

          // Attempts to connect to the voting system contract
          try {
            
            // Connecting to the ethereum provider
            const provider = new ethers.providers.Web3Provider(ethereum);

            // Signing the main user wallet address
            const signer = provider.getSigner(mainAddress);

            // Gets the contract address from .env
            const contractAddress = "0x1e3FD4eF5146DA8eC196856E5E83F2695852BE0f"

            // Finnally connects to the contract
            const contract = new ethers.Contract(contractAddress, abi, signer);

            // Getting info on the user's registry from the contract
            const registered = await contract.registered(walletAddress);

            // Getting info on if the user has voted before
            const voted_ = await contract.voted(walletAddress);

            // If user has voted
            if (voted_) {

              // Query the vote counts of the candidates at the time of web app use
              const voteCount = {
                Atiku: (await contract.candidates("Atiku Abubakar")).toNumber(),
                Kwankwaso: (await contract.candidates("Rabiu Kwankwaso")).toNumber(),
                Obi: (await contract.candidates("Peter Obi")).toNumber(),
                Tinubu: (await contract.candidates("Bola Tinubu")).toNumber(),
              }

              // Assigns the vote counts to the 'voteCount' state to be used in the web app
              setVoteCount(voteCount);

            }
            
            // Assigns the vote state to the 'voted' state
            setVoted(voted_);

            // Finally sets the user registry to its state
            return setRegistry(registered);

            }

          // In case of any error
          catch (err) {
            alert("An error occured")
            console.log(err);
          }
        }
      } 
      // If the ethereum object or wallet is not found
      else {
        alert("Wallet not found");
      }
    }

    // Calls the async function above
    getWallet();

  }, [walletAddress])


  // Function to register the user if not registered
  const register = async () => {
    // Just a heads up to check if a wallet address was found
    // If not, it returns an alert terminating the rest of the function
    if (walletAddress === null) {
      return alert("Wallet Address not found")
    }

    // Connecting the user to the contract
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner(walletAddress);
    const contractAddress = "0x1e3FD4eF5146DA8eC196856E5E83F2695852BE0f"
    const votingContract = new ethers.Contract(contractAddress, abi, signer);
    
    // The main registry process posted to the contract
    const registry = await votingContract.register(textDetails.firstName, textDetails.lastName, textDetails.age);
    await registry.wait(); // Prevents further functions from executing until registration is done

    // Setting the registry state to true
    setRegistry(true);

    return;

  }

  // Function to vote if the user has not voted
  const vote = async (candidate) => {
    // Checking if a wallet address was found (same conditions found in the 'register' async function)
    if (walletAddress === null) {
      return alert("Wallet Address not found")
    }

    // Connecting the user to the contract
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner(walletAddress);
    const contractAddress = "0x1e3FD4eF5146DA8eC196856E5E83F2695852BE0f"
    const votingContract = new ethers.Contract(contractAddress, abi, signer);

    // Checking if the user is registered
    if (registered) {

      // Then try voting for a candidate of choice
      try {
        
        // The main voting process
        const voting = await votingContract.vote(candidate);
        await voting.wait()

        // Setting the updates voting state as true
        // const voted = await votingContract.voted(walletAddress);
        return setVoted(true);
      } 
      // In case of an error
      catch(err) {
        alert ("Could not vote 😟")
      }
    }

  }

  return (
    <main>
      {/* The main section of the web app */}
      
      {/* The first section (The title) */}
      <section id='title'>
        Nigeria Decides (The Web3 way) 🇳🇬
      </section>

      {/* The second section (The voting body) */}
      <section>
        
        <div id='subtitle'>
          Your Candidates:
        </div>

        {/* Division containing the list of candidates */}
        <div id='candidates'>
          
          {/* Each div contains a condition in the onClick Property which checks if the user has voted already 👇 */}
          {/* It should lose the function of sending a voting decision to the contract (in simple terms, 'Disabled') */}
          {/* Else it will have the ability to send a voting decision to the contract */}
          {/* Each div also contains an inner div element which displays the current vote counts at the time of use */}
          
          {/* For Bola Tinubu */}
          <div onClick={!voted ? () => vote("Bola Tinubu") : () => {}}>
            Ahmed Bola Tinubu
            <div className='party'>
              All Progressives Congress
            </div>
            { voted ? <div>
              {voteCount !== null ? voteCount.Tinubu : <></>}
            </div> : <></> }
          </div>

          {/* For Peter Obi */}
          <div onClick={!voted ? () => vote("Peter Obi") : () => {}}>
            Peter Obi
            <div className='party'>
              Labour Party
            </div>
            { voted ? <div>
              {voteCount !== null ? voteCount.Obi : <></>}
            </div> : <></> }
          </div>

          {/* For Atiku Abubakar */}
          <div onClick={!voted ? () => vote("Atiku Abubakar") : () => {}}>
            Atiku Abubakar
            <div className='party'>
              People's Democratic Party
            </div>
            { voted ? <div>
              {voteCount !== null ? voteCount.Atiku : <></>}
            </div> : <></> }
          </div>

          {/* For Rabiu Kwankwaso */}
          <div onClick={!voted ? () => vote("Rabiu Kwankwaso") : () => {}}>
            Rabiu Kwankwaso
            <div className='party'>New Nigeria People's Party</div>
            { voted ? <div>
              {voteCount !== null ? voteCount.Kwankwaso : <></>}
            </div> : <></> }
          </div>

        </div>
      </section>

      {/* The third section (setup based on a condition if the user has not registered therefore not eligible to vote) */}
      { registered === false ?
      // If the user has not registered
      <section className='register-section'>
        Not yet a registered voter
        
        {/* The registration form */}
        <div className='register-form'>

          {/* Each input has a a function which modifies the user 'textDetails' state on change of input characters */}

          <input type="text" name='first-name' className='register-input' placeholder="First Name" onChange={(content) => {
            setTextDetails({...textDetails, firstName: content.target.value})
          }} />

          <input type="text" name='last-name' className='register-input' placeholder="Last Name" onChange={(content) => {
            setTextDetails({...textDetails, lastName: content.target.value})
          }} />

          <input type="text" name='age' maxLength={3} className='register-input' placeholder="Age" onChange={(content) => {
            let value = parseInt(content.target.value);
            if (value.toString() === 'NaN') {
              content.target.setAttribute('id', 'red')
            } else {
              content.target.setAttribute('id', '')
              setTextDetails({...textDetails, age: value})
            }
          }} />

        </div>

        
        {/* 
            Registry button which triggers the 'register' function and disables \n
            itself and other input elements in the registration form 
        */}
        <div id='register' onClick={() => {
          register();
          const self = document.getElementById('register')
          self.setAttribute('disabled', '');
          self.style.color = '#00000048';
          const inputList = document.querySelectorAll('input.register-input');
          inputList.forEach(elem => {
            elem.setAttribute('disabled', '')
          })
        }}>
          Register Here
        </div>

      </section>
      :
      <></>
      }

    
    </main>
  )
}

export default App;