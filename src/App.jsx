import React, { useEffect, useState } from 'react';
// import Votes from './Components/votes';
import './Styles/app.css';
import { ethers } from 'ethers';


const App = () => {

  const [walletAddress, setWalletAddress] = useState(null);
  const [registered, setRegistry] = useState(false);
  const [textDetails, setTextDetails] = useState({firstName: '', lastName: '', age: 0});
  const [voted, setVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(null);

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
      // Obtain the wallet address of the user
      const { ethereum } = window;
      if (ethereum) { // Checks if a wallet is detected
        
        const walletAddresses = await ethereum.request({method: 'eth_requestAccounts'});
        
        const mainAddress = walletAddresses[0]; // The main address connected by the user
        
        setWalletAddress(mainAddress)
        console.log("mainAddress: ", mainAddress);
        
        if (walletAddress !== null && walletAddress !== undefined) {
          console.log("If statement checked")
          try {
            console.log("Cheking the try statement ")
            const provider = new ethers.providers.Web3Provider(ethereum);
            console.log("Getting the providers")
            const signer = provider.getSigner(mainAddress);
            console.log("Gotten the signer")
            const contractAddress = import.meta.env.VITE_CONTRACT
            console.log(typeof contractAddress)
            const contract = new ethers.Contract(import.meta.env.VITE_CONTRACT, abi, signer);
            console.log("created an instance of the contract")
            console.log(contract);
            const registered = await contract.registered(walletAddress);
            console.log("Checking if user is registered")
            const voted_ = await contract.voted(walletAddress);
            console.log("Checking if user has voted");
            console.log(voted_, registered, "Completed");


            if (voted_) {
              const voteCount = {
                Atiku: (await contract.candidates("Atiku Abubakar")).toNumber(),
                Kwankwaso: (await contract.candidates("Rabiu Kwankwaso")).toNumber(),
                Obi: (await contract.candidates("Peter Obi")).toNumber(),
                Tinubu: (await contract.candidates("Bola Tinubu")).toNumber(),
              }
              setVoteCount(voteCount);
            }
            
            setVoted(voted_);
            return setRegistry(registered);
            }
          catch (err) {
            alert("An error occured")
            console.log(err);
          }
        }
      } else {
        alert("Wallet not found");
      }
    }
    getWallet();
  }, [walletAddress, ])

  const register = async () => {
    if (walletAddress === null) {
      return alert("Wallet Address not found")
    }
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner(walletAddress);
    const votingContract = new ethers.Contract(import.meta.env.VITE_CONTRACT, abi, signer);
    
    const registry = await votingContract.register(textDetails.firstName, textDetails.lastName, textDetails.age);
    await registry.wait();

    setRegistry(true);
    return;

  }

  const vote = async (candidate) => {
    if (walletAddress === null) {
      return alert("Wallet Address not found")
    }
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner(walletAddress);
    const votingContract = new ethers.Contract(import.meta.env.VITE_CONTRACT, abi, signer);

    if (registered) {
      try {
        const voting = await votingContract.vote(candidate);
        await voting.wait()
        const voted = await votingContract.voted(walletAddress);
        return setVoted(voted);
      } catch(err) {
        alert ("Could not vote 😟")
      }
    }

  }

  return (
    <main>
      <section id='title'>
        Nigeria Decides (The Web3 way) 🇳🇬
      </section>
      <section>
        <div id='subtitle'>
          Your Candidates:
        </div>
        <div id='candidates'>
          <div onClick={!voted ? () => vote("Bola Tinubu") : () => {}}>
            Ahmed Bola Tinubu
            <div className='party'>
              All Progressive Congress
            </div>
            { voted ? <div>
              {voteCount !== null ? voteCount.Tinubu : <></>}
            </div> : <></> }
          </div>
          <div onClick={!voted ? () => vote("Peter Obi") : () => {}}>
            Peter Obi
            <div className='party'>
              Labour Party
            </div>
            { voted ? <div>
              {voteCount !== null ? voteCount.Obi : <></>}
            </div> : <></> }
          </div>
          <div onClick={!voted ? () => vote("Atiku Abubakar") : () => {}}>
            Atiku Abubakar
            <div className='party'>
              People's Democratic Party
            </div>
            { voted ? <div>
              {voteCount !== null ? voteCount.Atiku : <></>}
            </div> : <></> }
          </div>
          <div onClick={!voted ? () => vote("Rabiu Kwankwaso") : () => {}}>
            Rabiu Kwankwaso
            <div className='party'>New Nigeria People's Party</div>
            { voted ? <div>
              {voteCount !== null ? voteCount.Kwankwaso : <></>}
            </div> : <></> }
          </div>
        </div>
      </section>
      { registered === false ?
      <section className='register-section'>
      Not yet registered
      <div className='register-form'>

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