import React, { useState, useEffect, useRef } from "react";
import "./App.css"; // Use App.css as requested
import UseLocalStorage from "./UseLocalStorage"; // Custom hook for local storage
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import { MdOutlineMedicalServices } from "react-icons/md";
import { MdEdit } from "react-icons/md";
import { FaHourglassStart } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import { IoTimeOutline } from "react-icons/io5";
import timeout from "./assets/time-out.svg";
import sound from "./assets/whistle.wav";
import gameover from "./assets/finish.wav";
import { FaVideo } from "react-icons/fa6";
import icon from "./assets/judo_nobg.png";
import CustomAlert from "./CustomAlert"; // Import the custom alert
import Modal from "./Modal"; // Import the Modal component
export default function App() {
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const [players, setPlayers] = UseLocalStorage("players", []); // Ensure setPlayers is defined
  const [playerName, setPlayerName] = useState("");
  const [gameFinished, setGameFinished] = useState(false); // Track if game is finished
  const [khakIntervals, setKhakIntervals] = useState({}); // Store intervals for khak timers
  const [editIndex, setEditIndex] = useState(null);
  const [alertMessage, setAlertMessage] = useState(""); // Declare alert message state
  const [showAlert, setShowAlert] = useState(false); // State to control
  const [matchTimer, setMatchTimer] = useState(() => {
    const savedTimer = localStorage.getItem("matchTimer");
    return savedTimer ? JSON.parse(savedTimer) : 180; // Default to 3 minutes
  });
  const [isMatchRunning, setIsMatchRunning] = useState(() => {
    return localStorage.getItem("isMatchRunning") === "true"; // Check if match timer was running before refresh
  });
  const [player2Color, setPlayer2Color] = useState(() => {
    // Retrieve the initial color from local storage, default to "bg-dark"
    const savedColor = localStorage.getItem("player2Color");
    return savedColor ? JSON.parse(savedColor) : "bg-dark"; // Default to black
  });

  const [timerFinished, setTimerFinished] = useState(false); // State for match timer completion
  const [deletePlayerIndex, setDeletePlayerIndex] = useState(null); // Index of player to delete
  const [personType, setPersonType] = useState(""); // State for the input box
  // Score state management
  const [wType, setWType] = useState(""); // State for the input box
  // Score state management
  const [scores, setScores] = UseLocalStorage("scores", {}); // Use local storage for scores
  // Timeout state management
  const [timeoutActive, setTimeoutActive] = useState([false, false]); // Track timeout state for each player
  const [timeoutIntervals, setTimeoutIntervals] = useState({});
  const [timeoutTimers, setTimeoutTimers] = useState([0, 0]); // Track timeout timers for each player
  // Individual timers for each player
  const [playerTimers, setPlayerTimers] = useState({});
  const [playerIntervals, setPlayerIntervals] = useState({});
  const [khakTimers, setKhakTimers] = useState([0, 0]);
  // Medical warnings state management
  const [medicalWarnings, setMedicalWarnings] = UseLocalStorage(
    "medicalWarnings",
    {}
  ); // Store medical warnings for each playerr
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleIconClick = () => {
    whistleSound.play();
    stopMatchTimer();
    setIsModalOpen(true); // Open the modal when icon is clicked
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
  };
  const whistleSound = new Audio(sound); // Reference to the whistle sound
  const finishSound = new Audio(gameover); //Reference to the finish sound
  const handleInputChange = (event) => {
    setPersonType(event.target.value); // Update the state with the input value
  };
  const handlewChange = (event) => {
    setWType(event.target.value); // Update the state with the input value
  };
  // Timer logic for overall match timer
  useEffect(() => {
    let interval;
    if (isMatchRunning && matchTimer > 0) {
      interval = setInterval(() => {
        setMatchTimer((prevTimer) => {
          const newTimer = prevTimer - 1;
          localStorage.setItem("matchTimer", JSON.stringify(newTimer)); // Update localStorage with new timer value
          return newTimer;
        });
      }, 1000);
    } else if (matchTimer === 0) {
      clearInterval(interval); // Stop the timer when it reaches zero
      if (!timerFinished) {
        // Check if this is the first time finishing
        finishSound.play();

        setTimeout(() => {
          const score1 = scores[players[0].name] || 0; // Get Player 1's score
          const score2 = scores[players[1].name] || 0; // Get Player 2's score

          // Determine who has the higher score
          if (score1 > score2) {
            setAlertMessage(`${players[0].name} برنده شد با${score1} امتیاز`);
            setShowAlert(true); // Show custom alert
          } else if (score2 > score1) {
            setAlertMessage(`${players[1].name}  برنده شد با${score2} امتیاز`);
            setShowAlert(true); // Show custom alert
          } else if (score1 == score2) {
            setAlertMessage(`مسابقه به امتیاز طلایی کشیده شد`);
            setShowAlert(true); // Show custom alert
          }
          checkWinner(); // Check who has more score when time is up
          setTimerFinished(true); // Set timer finished state
          setIsMatchRunning(false); // Stop the match timer
          localStorage.removeItem("matchTimer"); // Clear match timer from localStorage
          localStorage.removeItem("isMatchRunning"); // Clear running state from localStorage
        }, 1000);
      }
    }
    return () => clearInterval(interval); // Cleanup on unmount or when dependencies change
  }, [isMatchRunning, matchTimer]);

  const checkWinner = (currentScores) => {
    if (players.length === 2) {
      const score1 = currentScores[players[0].name] || 0;
      const score2 = currentScores[players[1].name] || 0;

      const scoreDifference = Math.abs(score1 - score2);

      // Check for an exact difference of 15
      if (scoreDifference === 15 && !gameFinished) {
        setGameFinished(true);
        if (isMatchRunning) {
          clearInterval();
          setIsMatchRunning(false);
          localStorage.setItem("isMatchRunning", "false");
        }
        finishSound.play();

        setTimeout(() => {
          setAlertMessage(
            `${
              score1 > score2 ? players[0].name : players[1].name
            }${" "}به وسیله  اختلاف ۱۵ امتیاز برنده شد  `
          );
          setShowAlert(true); // Show custom alert
        }, 500);
      }
    }
  };
  const startMatchTimer = () => {
    whistleSound.play(); // Play whistle sound when starting the timer
    setMatchTimer(180); // Reset to 3 minutes (180 seconds)
    setIsMatchRunning(true);
    localStorage.setItem("isMatchRunning", "true"); // Store running state in local storage
    localStorage.setItem("matchTimer", JSON.stringify(180)); // Store initial timer value in local storage
  };

  const stopMatchTimer = () => {
    if (isMatchRunning) {
      clearInterval();
      setIsMatchRunning(false);
      localStorage.setItem("isMatchRunning", "false");
      whistleSound.play();
    }
  };

  const continueMatchTimer = () => {
    if (!isMatchRunning && matchTimer > 0) {
      setIsMatchRunning(true);
      localStorage.setItem("isMatchRunning", "true"); // Store running state in local storage
      whistleSound.play();
    }
  };

  const addPlayer = () => {
    if (playerName.trim()) {
      if (players.length < 2) {
        const newPlayer = {
          name: playerName,
          yellowCards: 0,
          redCardIssued: false,
        };
        setPlayers((prevPlayers) => [...prevPlayers, newPlayer]);
        setScores((prevScores) => ({ ...prevScores, [playerName]: 0 }));
        setMedicalWarnings((prevWarnings) => ({
          ...prevWarnings,
          [playerName]: 0,
        })); // Initialize medical warnings for new player
        setPlayerName("");
      } else {
        setAlertMessage("Only two players are allowed");
        setShowAlert(true); // Show custom alert
      }
    } else {
      setAlertMessage("Please enter a name.");
      setShowAlert(true); // Show custom alert
    }
  };
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      addPlayer();
    }
  };
  const startEditing = (index) => {
    setEditIndex(index);
    setPlayerName(players[index].name);
    const modal = new window.bootstrap.Modal(
      document.getElementById("editModal")
    );
    modal.show();
  };

  const updatePlayer = () => {
    if (editIndex !== null && playerName.trim()) {
      const updatedPlayers = [...players];
      updatedPlayers[editIndex].name = playerName;
      const updatedScores = { ...scores };
      updatedScores[playerName] =
        updatedScores[updatedPlayers[editIndex].name] || 0;
      delete updatedScores[updatedPlayers[editIndex].name];
      setScores(updatedScores);
      setPlayers(updatedPlayers);
      const modal = window.bootstrap.Modal.getInstance(
        document.getElementById("editModal")
      );
      if (modal) {
        modal.hide();
      }
      setEditIndex(null);
      setPlayerName("");
    } else {
      setAlertMessage("Please enter a valid name.");
      setShowAlert(true); // Show custom alert
    }
  };

  // const confirmDeletePlayer = (index) => {
  //   setDeletePlayerIndex(index); // Set the index of the player to be deleted.
  //   const modal = new window.bootstrap.Modal(
  //     document.getElementById(`deleteConfirmModal-${index}`)
  //   );
  //   modal.show();
  // };
  // Function to issue a red card directly.
  const issueRedCard = (index) => {
    let updatedPlayers = [...players];
    updatedPlayers[index].redCardIssued = true;
    finishSound.play();
    stopMatchTimer();
    setTimeout(() => {
      setAlertMessage(`  ${updatedPlayers[index].name}   مستقیم   اخراج   شد`);
      setShowAlert(true); // Show custom alert
    }, 1000);
    setPlayers(updatedPlayers);
  };

  const deletePlayerAndRefresh = () => {
    if (deletePlayerIndex !== null) {
      setPlayers((prevPlayers) =>
        prevPlayers.filter((_, i) => i !== deletePlayerIndex)
      );
      setDeletePlayerIndex(null); // Reset after deletion.
      window.location.reload(); // Refresh the page after deletion.
    }
  };

  // Function to remove a red card from a specific player.
  const removeRedCardAndRefresh = (index) => {
    return setPlayers((prevPlayers) => {
      const updatedPlayers = [...prevPlayers];

      if (updatedPlayers[index]?.redCardIssued) {
        // alert(`${updatedPlayers[index].name} no longer has a red card.`);
        updatedPlayers[index].redCardIssued = false;

        localStorage.setItem("players", JSON.stringify(updatedPlayers)); // Save updates in local storage

        return updatedPlayers;
      }

      return prevPlayers;
    });
  };
  const issueYellowCard = (index) => {
    setPlayers((prevPlayers) => {
      const updatedPlayers = [...prevPlayers];
      if (!updatedPlayers[index].redCardIssued) {
        updatedPlayers[index].yellowCards++;
        updateOpposingScore(updatedPlayers[index].yellowCards, index);
        if (updatedPlayers[index].yellowCards >= 4) {
          finishSound.play();
          if (isMatchRunning) {
            clearInterval();
            setIsMatchRunning(false);
            localStorage.setItem("isMatchRunning", "false");
          }
          setTimeout(function () {
            setAlertMessage(
              `${
                updatedPlayers[index].name
              }  به وسیله دریافت اخطار چهارم اخراج شد  ${
                players[index === 0 ? 1 : 0].name
              } برنده شد     `
            );
            setShowAlert(true); // Show custom alert
          }, 500);

          updatedPlayers[index].redCardIssued = true;
          updatedPlayers[index].yellowCards = 0;
        }
      }
      return updatedPlayers;
    });
  };

  const updateOpposingScore = (yellowCardsCount, index) => {
    let opposingIndex = index === 0 ? 1 : 0;
    let scoreIncrease;

    switch (yellowCardsCount) {
      case 1:
        scoreIncrease = 1;
        break;
      case 2:
        scoreIncrease = 2;
        break;
      case 3:
        scoreIncrease = 3;
        break;
      default:
        return; // No increase for more than three yellow cards.
    }

    setScores((prevScores) => ({
      ...prevScores,
      [players[opposingIndex].name]:
        (prevScores[players[opposingIndex].name] || 0) + scoreIncrease,
    }));
  };

  // Function to remove a yellow card from a specific player.
  const removeYellowCard = (index) => {
    return setPlayers((prevPlayers) => {
      const updatedPlayers = [...prevPlayers];
      if (updatedPlayers[index]?.yellowCards > 0) {
        // Ensure there are yellow cards to remove
        const yellowCardsCount = updatedPlayers[index].yellowCards;

        // Decrease opposing player's score based on the number of yellow cards removed
        let opposingIndex = index === 0 ? 1 : 0;
        let scoreDecrease;

        switch (yellowCardsCount) {
          case 1:
            scoreDecrease = 1;
            break;
          case 2:
            scoreDecrease = 2;
            break;
          case 3:
            scoreDecrease = 3;
            break;
          default:
            return; // No decrease for more than three yellow cards.
        }

        // Decrease opposing player's score
        setScores((prevScores) => ({
          ...prevScores,
          [players[opposingIndex].name]: Math.max(
            0,
            (prevScores[players[opposingIndex].name] || 0) - scoreDecrease
          ),
        }));

        updatedPlayers[index].yellowCards--; // Remove one yellow card
      }
      return updatedPlayers; // Return updated players array
    });
  };

  // Function to handle removing a yellow card and refreshing the UI.
  const removeYellowCardAndRefresh = (index) => {
    removeYellowCard(index);
  };
  /** Medical Warning Functions **/

  const issueMedicalWarning = (index) => {
    let playerToIssueWarningFor = players[index];
    let currentWarningsCount =
      medicalWarnings[playerToIssueWarningFor.name] || 0;

    if (currentWarningsCount < 3) {
      currentWarningsCount++;
      setMedicalWarnings((prevWarnings) => ({
        ...prevWarnings,
        [playerToIssueWarningFor.name]: currentWarningsCount,
      }));

      if (currentWarningsCount === 3) {
        finishSound.play();
        let opposingIndex = index === 0 ? 1 : 0;
        stopMatchTimer();
        setTimeout(function () {
          setAlertMessage(
            `${playerToIssueWarningFor.name} اخطار پزشکی سوم را دریافت کرد ${players[opposingIndex].name} برنده شد`
          );
          setShowAlert(true); // Show custom alert
        }, 1000);

        // // Stop all player timers when a player wins
        // Object.values(playerIntervals).forEach((intervalId) =>
        //   clearInterval(intervalId)
        // );

        // deletePlayerAndRefresh();
      }
    } else {
      setAlertMessage(
        `${playerToIssueWarningFor.name} اخطار پزشکی سوم را دریافت کرد `
      );
      setShowAlert(true); // Show custom alert
    }
  };
  /** Individual Timer Functions **/
  // const startPlayerTimer = (index) => {
  //   let playerToStartTimerFor = players[index];
  //   let countdownValue = playerTimers[playerToStartTimerFor.name] || 60; // Start with a countdown of one minute

  //   let intervalId;

  //   if (!playerIntervals[playerToStartTimerFor.name]) {
  //     intervalId = setInterval(() => {
  //       setPlayerTimers((prevTimers) => {
  //         let updatedTimers = { ...prevTimers };
  //         updatedTimers[playerToStartTimerFor.name]--;

  //         if (updatedTimers[playerToStartTimerFor.name] <= 0) {
  //           if (isMatchRunning) {
  //             clearInterval();
  //             setIsMatchRunning(false);
  //             localStorage.setItem("isMatchRunning", "false");
  //           }
  //           clearInterval(intervalId);
  //           finishSound.play();
  //           setTimeout(function () {
  //             alert(`${playerToStartTimerFor.name} did not arrive on time!`);
  //           }, 1000);

  //           deletePlayerAndRefresh();
  //           return {};
  //         }

  //         return updatedTimers;
  //       });
  //     }, 1000);

  //     setPlayerTimers((prevTimers) => ({
  //       ...prevTimers,
  //       [playerToStartTimerFor.name]: countdownValue,
  //     }));
  //     setPlayerIntervals((prevIntervals) => ({
  //       ...prevIntervals,
  //       [playerToStartTimerFor.name]: intervalId,
  //     }));
  //   } else {
  //     alert(`${playerToStartTimerFor.name}'s timer is already running.`);
  //   }
  // };

  // const cancelPlayerTimer = (index) => {
  //   let playerToCancelTimerFor = players[index];

  //   if (playerIntervals[playerToCancelTimerFor.name]) {
  //     clearInterval(playerIntervals[playerToCancelTimerFor.name]);

  //     // Reset the timer state for this player after cancellation
  //     setPlayerTimers((prevTimers) => ({
  //       ...prevTimers,
  //       [playerToCancelTimerFor.name]: undefined,
  //     }));

  //     // alert(`Cancelled ${playerToCancelTimerFor.name}'s late arrival timer.`);

  //     // Remove interval reference to allow starting again later
  //     setPlayerIntervals((prevIntervals) => ({
  //       ...prevIntervals,
  //       [playerToCancelTimerFor.name]: undefined,
  //     }));
  //   } else {
  //     alert(`${playerToCancelTimerFor.name}'s timer is not running.`);
  //   }
  // };
  // Toggle Timer Function
  const togglePlayerTimer = (index) => {
    let playerToToggleTimerFor = players[index];
    let countdownValue = playerTimers[playerToToggleTimerFor.name] || 60; // Start with a countdown of one minute

    if (!playerIntervals[playerToToggleTimerFor.name]) {
      // Start the timer
      const intervalId = setInterval(() => {
        setPlayerTimers((prevTimers) => {
          let updatedTimers = { ...prevTimers };
          updatedTimers[playerToToggleTimerFor.name]--;

          if (updatedTimers[playerToToggleTimerFor.name] <= 0) {
            clearInterval(intervalId);
            if (isMatchRunning) {
              setIsMatchRunning(false);
              localStorage.setItem("isMatchRunning", "false");
            }
            finishSound.play();
            setTimeout(() => {
              setAlertMessage(`${playerToToggleTimerFor.name} به مسابقه نرسبد`);
              setShowAlert(true); // Show custom alert
            }, 500);

            return {};
          }

          return updatedTimers;
        });
      }, 1000);

      // Store interval ID and initialize timer value
      setPlayerIntervals((prevIntervals) => ({
        ...prevIntervals,
        [playerToToggleTimerFor.name]: intervalId,
      }));
      setPlayerTimers((prevTimers) => ({
        ...prevTimers,
        [playerToToggleTimerFor.name]: countdownValue,
      }));
    } else {
      // Stop the timer
      clearInterval(playerIntervals[playerToToggleTimerFor.name]);
      setPlayerTimers((prevTimers) => ({
        ...prevTimers,
        [playerToToggleTimerFor.name]: undefined,
      }));
      setPlayerIntervals((prevIntervals) => ({
        ...prevIntervals,
        [playerToToggleTimerFor.name]: undefined,
      }));
    }
  };

  // Update local storage whenever player2Color changes
  useEffect(() => {
    localStorage.setItem("player2Color", JSON.stringify(player2Color));
  }, [player2Color]);
  // /** Unified Timer Function **/
  // const togglePlayerTimer = (index) => {
  //   let playerToToggleTimerFor = players[index];
  //   let currentTimerValue = playerTimers[playerToToggleTimerFor.name] || 60; // Start with a countdown of one minute

  //   if (!playerIntervals[playerToToggleTimerFor.name]) {
  //     // Start timer logic here
  //     const intervalId = setInterval(() => {
  //       setPlayerTimers((prevTimers) => {
  //         let updatedTimers = { ...prevTimers };
  //         updatedTimers[playerToToggleTimerFor.name]--;

  //         if (updatedTimers[playerToToggleTimerFor.name] <= 0) {
  //           finishSound.play();
  //           clearInterval(intervalId);
  //           setTimeout(() => {
  //             setAlertMessage(`${playerToToggleTimerFor.name} غیبت بازیکن`);
  //             setShowAlert(true); // Show custom alert
  //           }, 500);

  //           deletePlayerAndRefresh(); // Implement this function as needed
  //           return {}; // Reset timers after alert
  //         }

  //         return updatedTimers;
  //       });
  //     }, 1000);

  //     setPlayerTimers((prevTimers) => ({
  //       ...prevTimers,
  //       [playerToToggleTimerFor.name]: currentTimerValue,
  //     }));
  //     setPlayerIntervals((prevIntervals) => ({
  //       ...prevIntervals,
  //       [playerToToggleTimerFor.name]: intervalId,
  //     }));
  //   } else {
  //     // Stop timer logic here
  //     clearInterval(playerIntervals[playerToToggleTimerFor.name]);
  //     delete playerIntervals[playerToToggleTimerFor.name];
  //     setPlayerTimers((prevTimers) => ({
  //       ...prevTimers,
  //       [playerToToggleTimerFor.name]: undefined, // Reset to undefined or handle as needed
  //     }));
  //   }
  // };
  // const increaseScore = (playerName) => {
  //   setScores((prevScores) => ({
  //     ...prevScores,
  //     [playerName]: (prevScores[playerName] || 0) + 1,
  //   }));
  //   checkWinner();
  // };
  const increaseScore = (playerName) => {
    setScores((prevScores) => {
      // Increase the player's score by 1
      const newScore = (prevScores[playerName] || 0) + 1;

      // Update scores
      const updatedScores = {
        ...prevScores,
        [playerName]: newScore,
      };

      // Check for winner after increasing score
      checkWinner(updatedScores); // Pass updated scores to checkWinner

      return updatedScores; // Return updated scores
    });
  };
  const decreaseScore = (playerName) => {
    setScores((prevScores) => {
      const newScore = Math.max(0, (prevScores[playerName] || 0) - 1); // Decrease player's score by 1

      // Update scores
      const updatedScores = {
        ...prevScores,
        [playerName]: newScore,
      };

      // Check for winner after decreasing score
      checkWinner(updatedScores); // Pass updated scores to checkWinner

      return updatedScores; // Return updated scores
    });
  };
  // const timeoutPlayer = (index) => {
  //   let playerToTimeout = players[index];
  //   stopMatchTimer();
  //   // Stop the player's timer if it's running
  //   if (playerIntervals[playerToTimeout.name]) {
  //     clearInterval(playerIntervals[playerToTimeout.name]);
  //     setPlayerIntervals((prevIntervals) => ({
  //       ...prevIntervals,
  //       [playerToTimeout.name]: undefined,
  //     }));
  //   }

  //   // Start a countdown from 1 to 15 seconds
  //   let countdownValue = 1;
  //   const timeoutIntervalId = setInterval(() => {
  //     setTimeoutTimers((prevTimers) => {
  //       let updatedTimers = { ...prevTimers };
  //       updatedTimers[playerToTimeout.name] = countdownValue; // Set current countdown value

  //       // Check if the timer has reached 10 seconds
  //       if (countdownValue === 10) {
  //         // Award 2 points to the opposing player
  //         let opposingIndex = index === 0 ? 1 : 0;
  //         setScores((prevScores) => ({
  //           ...prevScores,
  //           [players[opposingIndex].name]:
  //             (prevScores[players[opposingIndex].name] || 0) + 2,
  //         }));
  //       }

  //       // Check if the timer has reached zero
  //       if (countdownValue >= 15) {
  //         let opposingIndex = index === 0 ? 1 : 0;
  //         finishSound.play();
  //         if (isMatchRunning) {
  //           clearInterval();
  //           setIsMatchRunning(false);
  //           localStorage.setItem("isMatchRunning", "false");
  //         }
  //         clearInterval(timeoutIntervalId);
  //         setTimeout(function () {
  //           alert(`${players[opposingIndex].name} wins!`);
  //         }, 1000);

  //         deletePlayerAndRefresh();
  //         return {}; // Return empty object to reset timer display
  //       }

  //       countdownValue++; // Increment countdown value
  //       return updatedTimers; // Return updated timers
  //     });
  //   }, 1000);

  //   setPlayerIntervals((prevIntervals) => ({
  //     ...prevIntervals,
  //     [playerToTimeout.name]: timeoutIntervalId,
  //   })); // Store interval ID
  // };

  // const stopTimeout = (index) => {
  //   let opposingIndex = index === 0 ? 1 : 0;
  //   let playerToStop = players[index];
  //   if (playerIntervals[playerToStop.name]) {
  //     clearInterval(playerIntervals[playerToStop.name]); // Stop the timeout countdown
  //     setPlayerIntervals((prevIntervals) => ({
  //       ...prevIntervals,
  //       [playerToStop.name]: undefined, // Clear interval reference
  //     }));
  //     setTimeoutTimers((prevTimers) => ({
  //       ...prevTimers,
  //       [playerToStop.name]: undefined, // Reset timer display to null or initial value
  //     }));
  //     // alert(`${playerToStop.name}'s timeout has been stopped.`);
  //   }
  // };
  const finishtheplay = (index) => {
    const playerName = players[index].name;
    finishSound.play();
    if (isMatchRunning) {
      clearInterval();
      setIsMatchRunning(false);
      localStorage.setItem("isMatchRunning", "false");
    }
    setTimeout(() => {
      setAlertMessage(`${playerName} به وسیله ضربه فنی برنده شد`);
      setShowAlert(true); // Show custom alert
    }, 500);
  };
  // Function to handle toggling the Khak timer
  const toggleKhakTimer = (index) => {
    const playerName = players[index].name;

    // Reset all other Khak timers when starting a new one
    Object.keys(khakIntervals).forEach((key) => {
      if (key !== playerName && khakIntervals[key]) {
        clearInterval(khakIntervals[key]);
        setKhakTimers((prevKhaks) => {
          let updatedKhaksArray = [...prevKhaks];
          updatedKhaksArray[
            players.findIndex((player) => player.name === key)
          ] = 0; // Reset other player's timer
          return updatedKhaksArray;
        });
        delete khakIntervals[key]; // Remove from intervals object
      }
    });

    if (!khakIntervals[playerName]) {
      // Start the Khak timer

      const intervalId = setInterval(() => {
        setKhakTimers((prevKhaks) => {
          let updatedKhaksArray = [...prevKhaks];
          updatedKhaksArray[index]++;

          if (updatedKhaksArray[index] === 11) {
            // Award points to opposing player at 11 seconds

            setScores((prevScores) => ({
              ...prevScores,
              [playerName]: (prevScores[playerName] || 0) + 3,
            }));
          }

          if (updatedKhaksArray[index] === 15) {
            stopMatchTimer();
            if (isMatchRunning) {
              clearInterval();
              setIsMatchRunning(false);
              localStorage.setItem("isMatchRunning", "false");
            }
            // setTimeout(() => {
            //   setAlertMessage(`${playerName}`);
            //   setShowAlert(true); // Show custom alert
            // }, 500);
            // Award points to opposing player at 15 seconds

            setScores((prevScores) => ({
              ...prevScores,
              [playerName]: (prevScores[playerName] || 0) + 1,
            }));
            clearInterval(intervalId); // Stop after reaching max time.
            // alert(`${players[opposingIndex].name} wins!`);
          }

          return updatedKhaksArray; // Return updated timers
        });
      }, 1000);

      // Store the interval ID for this player's Khak timer
      setKhakIntervals((prevIntervals) => ({
        ...prevIntervals,
        [playerName]: intervalId,
      }));

      // Resetting khak timer value to zero when starting again
      setKhakTimers((prevTimers) => {
        let updatedTimers = [...prevTimers];
        updatedTimers[index] = updatedTimers[index] || 0; // Initialize if undefined
        return updatedTimers;
      });
    } else {
      // Reset the Khak timer instead of stopping it

      clearInterval(khakIntervals[playerName]); // Clear the interval for this player's Khak timer

      // Resetting khak timer value to zero when starting again
      setKhakTimers((prevTimers) => {
        let updatedTimers = [...prevTimers];
        updatedTimers[index] = 0; // Reset to zero when clicked again

        return updatedTimers;
      });

      delete khakIntervals[playerName]; // Remove from intervals object
    }
  };

  const [manualTimer, setManualTimer] = useState(0); // State for manual timer input

  // Function to handle manual timer input change
  const handleManualTimerChange = (e) => {
    const value = e.target.value;
    setManualTimer(value);
  };

  // Function to set the timer based on user input
  const setTimerManually = () => {
    const parsedValue = parseInt(manualTimer, 10);
    if (!isNaN(parsedValue) && parsedValue >= 0) {
      // Update matchTimer with parsed value in seconds
      setMatchTimer(parsedValue * 60); // Assuming you want to set it in MM:SS format
    }
  };
  const handleKeyPres = (event) => {
    if (event.key === "Enter") {
      setTimerManually(); // Call function to set the timer when Enter is pressed
    }
  };
  // Load player names from local storage when the component mounts
  useEffect(() => {
    const storedPlayers = JSON.parse(localStorage.getItem("players"));
    if (storedPlayers) {
      setPlayers(storedPlayers);
      setPlayer1Name(storedPlayers[0]?.name || "");
      setPlayer2Name(storedPlayers[1]?.name || "");
    }
  }, []);

  // Function to update player names in local storage
  const updatePlayerNames = () => {
    const newPlayers = [
      { name: player1Name, yellowCards: 0, redCardIssued: false },
      { name: player2Name, yellowCards: 0, redCardIssued: false },
    ];
    setPlayers(newPlayers);
    localStorage.setItem("players", JSON.stringify(newPlayers)); // Save to local storage
  };
  // Function to handle starting and stopping timeouts
  const toggleTimeout = (index) => {
    let playerToTimeout = players[index];

    // Check if the other player's timeout is active and stop it
    const opposingIndex = index === 0 ? 1 : 0;
    if (timeoutActive[opposingIndex]) {
      stopTimeout(opposingIndex); // Stop the opposing player's timeout
    }

    if (!timeoutActive[index]) {
      // Start timeout

      stopMatchTimer(); // Stop the match timer

      let countdownValue = 0; // Reset countdown value for this player
      const timeoutIntervalId = setInterval(() => {
        countdownValue++;
        setTimeoutTimers((prevTimers) => {
          const updatedTimers = [...prevTimers];
          updatedTimers[index] = countdownValue; // Update the timer for this player

          // Check if the timer has reached the limit (e.g., awarding points)
          if (countdownValue === 11) {
            let opposingIndex = index === 0 ? 1 : 0;
            setScores((prevScores) => ({
              ...prevScores,
              [players[opposingIndex].name]:
                (prevScores[players[opposingIndex].name] || 0) + 2,
            }));
          }

          // Check if the timer has reached zero
          if (countdownValue >= 15) {
            clearInterval(timeoutIntervalId); // Stop the interval

            finishSound.play();
            setTimeout(() => {
              setAlertMessage(
                `${players[opposingIndex].name} به وسیله ضربه فنی برنده شد`
              );
              setShowAlert(true); // Show custom alert
            }, 500);
            resetTimeout(index);
            return updatedTimers; // Return updated timers
          }

          return updatedTimers; // Return updated timers
        });
      }, 1000);

      // Store the interval ID for this player's timeout
      setTimeoutIntervals((prevIntervals) => ({
        ...prevIntervals,
        [playerToTimeout.name]: timeoutIntervalId,
      }));
    } else {
      // Stop timeout

      clearInterval(timeoutIntervals[playerToTimeout.name]); // Clear the interval for this player's timeout
      setTimeoutIntervals((prevIntervals) => ({
        ...prevIntervals,
        [playerToTimeout.name]: undefined,
      }));

      setTimeoutTimers((prevTimers) => {
        const updatedTimers = [...prevTimers];
        updatedTimers[index] = 0; // Reset timer display to zero or initial value
        return updatedTimers;
      });
    }

    // Function to reset timeout state and timers
    const resetTimeout = (index) => {
      setTimeoutIntervals((prevIntervals) => ({
        ...prevIntervals,
        [players[index].name]: undefined,
      }));
    };
    // Toggle the active state for this player's timeout
    setTimeoutActive((prevActive) => {
      const newActive = [...prevActive];
      newActive[index] = !newActive[index]; // Toggle active state
      return newActive;
    });
  };

  const stopTimeout = (index) => {
    let playerToStop = players[index];
    clearInterval(timeoutIntervals[playerToStop.name]); // Clear the interval for this player's timeout
    setTimeoutIntervals((prevIntervals) => ({
      ...prevIntervals,
      [playerToStop.name]: undefined,
    }));

    setTimeoutTimers((prevTimers) => {
      const updatedTimers = [...prevTimers];
      updatedTimers[index] = 0; // Reset timer display to zero or initial value
      return updatedTimers;
    });

    setTimeoutActive((prevActive) => {
      const newActive = [...prevActive];
      newActive[index] = false; // Set active state to false
      return newActive;
    });
  };
  const removeMedicalWarning = (playerName) => {
    return setMedicalWarnings((prevWarnings) => {
      const updatedWarningsCount = Math.max(
        0,
        (prevWarnings[playerName] || 0) - 1
      );
      return { ...prevWarnings, [playerName]: updatedWarningsCount };
    });
  };
  /** Close Alert Function **/
  const closeAlert = () => {
    setShowAlert(false);
  };
  const changeToRed = () => {
    setPlayer2Color("bg-danger"); // Change Player 2's background to red
  };

  // Function to revert Player 2's box back to dark
  const changeToBlack = () => {
    setPlayer2Color("bg-dark"); // Revert Player 2's background to dark
  };
  /** Render Function **/
  return (
    <div className="container">
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "0",
        }}
      >
        <FaVideo
          style={{ width: "7rem", height: "7rem", cursor: "pointer" }}
          onClick={handleIconClick}
        />
        <Modal isOpen={isModalOpen} onClose={closeModal} />
        <img
          src={icon}
          alt="icon"
          style={{ width: "14rem", height: "14rem" }}
        />

        {/* Independent Input Box with larger font size */}
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <input
            type="text"
            placeholder="جوانان"
            value={personType}
            onChange={handleInputChange}
            style={{
              width: "160px",
              height: "60px",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid black",
              fontSize: "38px", // Increase font size here
            }}
          />
          <input
            type="text"
            placeholder="-38kg"
            value={wType}
            onChange={handlewChange}
            style={{
              width: "160px",
              height: "60px",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid black",
              fontSize: "38px", // Increase font size here
            }}
          />
        </div>
      </div>
      <h1 className="text-center mb-4 text-kom">
        کمیته داوران انجمن دفاع شخصی فدراسیون جودو
      </h1>
      {/* Match Timer Display */}
      <div className="text-center mb-4">
        <h1 style={{ fontSize: "105px" }}>
          {Math.floor(matchTimer / 60)}:{" "}
          {(matchTimer % 60).toString().padStart(2, "0")}
        </h1>
        {/* Timer Control Buttons and Input Field in a Row */}
        <div className="d-flex justify-content-center align-items-center mb-3">
          {/* Display in MM:SS format */}
          <button
            className="btn btn-success me-1 "
            onClick={continueMatchTimer}
          >
            {" "}
            شروع{" "}
          </button>
          <button className="btn btn-danger me-1 " onClick={stopMatchTimer}>
            {" "}
            تمام{" "}
          </button>
          <button className="btn btn-primary me-1 " onClick={startMatchTimer}>
            {" "}
            ریست{" "}
          </button>
          <input
            type="number"
            value={manualTimer}
            onChange={(e) => setManualTimer(e.target.value)}
            onKeyPress={handleKeyPres}
            placeholder="Enter time in minutes"
            className="form-control me-1"
            style={{ width: "6rem", height: "2.4rem" }}
          />
        </div>

        {timerFinished && <p className="text-danger">مسابقه به اتمام رسید</p>}
      </div>
      {/* Player Input */}
      <div className="input-group mb-3">
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          onKeyPress={(event) => handleKeyPress(event)}
          placeholder="نام را وارد کنید"
          className="form-control"
        />
        <button onClick={addPlayer} className="btn btn-primary">
          اضافه کردن
        </button>
      </div>
      {/* Player List */}
      <ul className="list-group d-flex flex-column">
        {players.map((player, index) => (
          <li
            key={index}
            style={{ padding: "15px" }}
            className={`list-group-item d-flex justify-content-between align-items-center ${
              index % 2 === 0
                ? "bg-white"
                : player2Color === "bg-dark"
                ? " bg-dark text-white"
                : "bg-danger text-white"
            }`}
          >
            <span style={{ flex: 1, fontSize: "40px" }}>
              {player.name}
              <span style={{ marginLeft: "10px" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "5px 10px",
                    border: "1px solid #007bff",
                    borderRadius: "5px",
                    backgroundColor: "#e7f1ff",
                    color: "#007bff",
                  }}
                >
                  {scores[player.name] || 0}
                </span>

                <button
                  onClick={() => startEditing(index)}
                  className="btn ms-1"
                  style={{ color: "#ffc007", fontSize: "2rem" }}
                >
                  <MdEdit />
                </button>
                {!index % 2 === 0 && (
                  <>
                    <button
                      onClick={() => {
                        changeToBlack();
                      }}
                      className="btn btn-dark"
                      style={{ borderRadius: "100%", borderColor: "white" }}
                    ></button>{" "}
                    <button
                      onClick={() => {
                        changeToRed();
                      }}
                      className="btn btn-danger"
                      style={{ borderRadius: "100%", borderColor: "white" }}
                    ></button>
                  </>
                )}
              </span>

              {/* Display Yellow Cards */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {Array.from({ length: player.yellowCards }).map((_, i) => (
                  <span
                    key={i}
                    style={{
                      width: "50px",
                      height: "50px",
                      border: "1px solid black",
                      backgroundColor: "#FFEA00",
                      display: "inline-block",
                      marginLeft: "5px",
                      borderRadius: "3px",
                    }}
                    onClick={() => removeYellowCard(index)}
                  />
                ))}
                {/* Display Red Card */}
                {player.redCardIssued && (
                  <span
                    style={{
                      width: "50px",
                      height: "50px",
                      backgroundColor: "red",
                      display: "inline-block",
                      marginLeft: "5px",
                      borderRadius: "3px",
                      border: "1px solid black",
                      cursor: "pointer",
                    }}
                    onClick={() => removeRedCardAndRefresh(index)}
                  />
                )}
                {/* Display Medical Warnings */}
                {Array.from({ length: medicalWarnings[player.name] || 0 }).map(
                  (_, i) => (
                    <MdOutlineMedicalServices
                      style={{
                        color: "#00a6ff",
                        width: "30px",
                        height: "30px",
                      }}
                      key={`med-${i}`}
                      onClick={() => removeMedicalWarning(player.name)}
                    />
                  )
                )}
              </div>
            </span>

            <div className="div-btns">
              <button
                style={{
                  width: "60px",
                  height: "60px",
                  border: "1px solid black",
                }}
                onClick={() => increaseScore(player.name)}
                className="btn btn-success  me-1"
              >
                +
              </button>
              <button
                style={{
                  width: "60px",
                  height: "60px",
                  border: "1px solid black",
                }}
                onClick={() => decreaseScore(player.name)}
                className="btn btn-danger  me-1"
              >
                -
              </button>
              {/* Single Khak Timer Button */}
              <button
                onClick={() => {
                  finishtheplay(index);
                }}
                style={{
                  width: "40px",
                  height: "60px",
                  border: "1px solid black",
                }}
                className="btn btn-danger  me-1 p-1"
              >
                ضربه فنی{" "}
              </button>
              <button
                onClick={() => toggleKhakTimer(index)}
                className={`btn me-1 ${
                  khakIntervals[players[index].name] ? "btn-danger" : "btn-info"
                }`}
                style={{
                  border: "1px solid black",
                  backgroundColor: khakIntervals[players[index].name]
                    ? "#29bc5e"
                    : "#66c98a",
                  width: "60px",
                  height: "60px",
                }}
              >
                {khakIntervals[players[index].name] ? "ریست خاک " : "شروع خاک"}
              </button>

              {/* Display Khak Timer */}
              <span
                style={{
                  marginLeft: "10px",
                  marginRight: "10px",
                  fontSize: "65px",
                }}
              >
                {khakTimers[index]} "
              </span>
              {/* Medical Warning Button */}
              <button
                onClick={() => issueMedicalWarning(index)}
                className="btn btn-danger  me-1"
                style={{
                  width: "60px",
                  height: "60px",
                  border: "1px solid black",
                }}
              >
                <MdOutlineMedicalServices style={{ color: "white" }} />
                {/* <MdOutlineMedicalServices style={{ color: "white" }} /> :{" "}
                {medicalWarnings[player.name] || "0"} */}
              </button>
              {/* Single Timeout Button */}
              <button
                onClick={() => toggleTimeout(index)}
                className={`btn me-1 ${
                  timeoutActive[index] ? "btn-danger" : "btn-warning"
                }`}
                style={{
                  backgroundColor: timeoutActive[index] ? "#FF6B6B" : "#B9D9EB",
                  border: "1px solid black",
                }}
              >
                <img
                  src={timeout}
                  alt="تایم اوت"
                  style={{ width: "30px", height: "50px" }}
                />
                {timeoutActive[index] ? "تایم اوت " : "تایم اوت "}
              </button>
              {/* Display Timeout Timer */}
              <span
                style={{
                  marginLeft: "10px",
                  marginRight: "10px",
                  fontSize: "65px",
                }}
              >
                {timeoutTimers[index]}"
              </span>

              {/* Unified Player Timer Button */}
              {/* <button
                onClick={() => togglePlayerTimer(index)} // Toggle timer on click
                className={`btn me-1 ${
                  playerIntervals[player.name] ? "btn-danger" : "btn-warning"
                }`}
                style={{
                  border: "none",
                  backgroundColor: playerIntervals[player.name]
                    ? "#ff3333"
                    : "#cf8484",
                  width: "80px",
                  height: "60px",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                {playerIntervals[player.name] ? "کنسل " : " تایمر"}
              </button>

            
              <span style={{ marginLeft: "10px", marginRight: "10px" }}>
                {playerTimers[player.name] !== undefined
                  ? playerTimers[player.name]
                  : "60"}{" "}
                "
              </span> */}

              {/* Display Medical Warning Count */}
              {/* <span style={{ marginLeft: "5px", marginRight: "5px" }}>
                <MdOutlineMedicalServices style={{ color: "red" }} /> :{" "}
                {medicalWarnings[player.name] || "0"}
              </span> */}
              {/* Issue Yellow Card Button */}

              <button
                onClick={() => issueYellowCard(index)}
                className="btn btn-info me-1"
                style={{
                  backgroundColor: "yellow",
                  border: "1px solid black",
                  width: "60px",
                  height: "60px",
                }}
              >
                کارت زرد
              </button>
              <button
                onClick={() => issueRedCard(index)}
                className="btn btn-danger me-1"
                style={{
                  width: "60px",
                  height: "60px",
                  border: "1px solid black",
                }}
              >
                کارت قرمز
              </button>

              <button
                onClick={() => togglePlayerTimer(index)}
                className={`btn ${
                  playerIntervals[player.name] ? "btn-warning" : "btn-info"
                } me-1`}
                style={{
                  width: "70px",
                  height: "60px",
                  border: "1px solid black",
                }}
              >
                {playerIntervals[player.name]
                  ? " غیبت ورزشکار"
                  : "  غیبت ورزشکار"}
              </button>
              {/* Show individual timer countdown */}
              <span
                style={{
                  marginLeft: "10px",
                  marginRight: "10px",
                  fontSize: "65px",
                }}
              >
                {playerTimers[player.name] !== undefined
                  ? playerTimers[player.name]
                  : "60"}
              </span>
              {/* Start Timeout Button */}
              {/* <button
                onClick={() => timeoutPlayer(index)}
                className="btn me-1"
                style={{ backgroundColor: "#B9D9EB" }}
              >
                <img
                  src={timeout}
                  alt="تایم اوت"
                  style={{ width: "1rem", height: "1rem" }}
                />
              </button> */}
              {/* Stop Timeout Button */}
              {/* <button
                onClick={() => stopTimeout(index)}
                className="btn btn-danger "
              >
                cn T
              </button> */}

              {/* Display Timeout Timer */}
              {/* <span style={{ marginLeft: "10px", marginRight: "10px" }}>
                {timeoutTimers[player.name] !== undefined
                  ? timeoutTimers[player.name]
                  : "0"}
                "
              </span> */}
              {/* Delete Player Button
              {/* <button
                onClick={() => confirmDeletePlayer(index)}
                className="btn btn-danger "
              >
                {" "}
                <FaRegTrashCan />{" "}
              </button> */}
            </div>
            {/* Modal for Confirming Deletion of Player */}
            {/* <div
              className="modal fade"
              id={`deleteConfirmModal-${index}`}
              tabIndex="-1"
              aria-labelledby={`deleteConfirmModalLabel-${index}`}
              aria-hidden="true"
            >
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5
                      className="modal-title"
                      id={`deleteConfirmModalLabel-${index}`}
                    >
                      {" "}
                      Delete Player{" "}
                    </h5>{" "}
                 Update title 
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="modal-body">
                    {" "}
                    Are you sure you want to delete this player?{" "}
                  </div>{" "}
                  Confirmation message
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-bs-dismiss="modal"
                    >
                      {" "}
                      Cancel{" "}
                    </button>{" "}
                    Button to confirm deletion of player
                    <button
                      type="button"
                      onClick={() => deletePlayerAndRefresh()}
                      Call
                      delete
                      function
                      directly
                      className="btn btn-danger"
                    >
                      {" "}
                      Delete Player{" "}
                    </button>{" "}
                    Only deletes after confirmation
                  </div>
                </div>
              </div>
            </div> */}
            {/* Modal for Confirming Deletion of Yellow Card */}
            {/* {Array.from({ length: player.yellowCards }).map((_, i) => (
              <>
                Modal Trigger for Yellow Card Clicked
                <div
                  className="modal fade"
                  id={`deleteYellowCardModal-${index}`}
                  tabIndex="-1"
                  aria-labelledby={`deleteYellowCardModalLabel-${index}`}
                  aria-hidden="true"
                >
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5
                          className="modal-title"
                          id={`deleteYellowCardModalLabel-${index}`}
                        >
                          {" "}
                          Delete Yellow Card{" "}
                        </h5>{" "}
                        Update title
                        <button
                          type="button"
                          className="btn-close"
                          data-bs-dismiss="modal"
                          aria-label="Close"
                        ></button>
                      </div>
                      <div className="modal-body">
                        {" "}
                        Are you sure you want to delete this yellow card for{" "}
                        {player.name}?{" "}
                      </div>{" "}
                      Confirmation message
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          data-bs-dismiss="modal"
                        >
                          {" "}
                          Cancel{" "}
                        </button>{" "}
                        Button to confirm deletion of yellow card
                        <button
                          type="button"
                          onClick={() => removeYellowCardAndRefresh(index)}
                          className="btn btn-danger"
                        >
                          {" "}
                          Delete Yellow Card
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ))} */}
          </li>
        ))}
      </ul>
      {/* Bootstrap Modal for Editing Player */}
      <div className="d-text">
        {" "}
        <p className="footer">تهیه و تنظیم : سهیلا دادخواه و مهرداد معاشری</p>
      </div>
      <div
        className="modal fade"
        id="editModal"
        tabIndex="-1"
        aria-labelledby="editModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="editModalLabel">
                {" "}
                ویرایش نام{" "}
              </h5>{" "}
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder={"Enter new name"}
                onKeyPress={(event) =>
                  event.key === "Enter" ? updatePlayer() : null
                }
                className={"form-control"}
              />
            </div>
            <div className={"modal-footer"}>
              <button
                type={"button"}
                data-bs-dismiss={"modal"}
                aria-label={"Close"}
                className="btn btn-danger"
              >
                {" "}
                کنسل
              </button>{" "}
              {/* Cancel button */}{" "}
              <button
                type={"button"}
                onClick={updatePlayer}
                className="btn btn-secondary"
              >
                {" "}
                ویرایش{" "}
              </button>{" "}
              {/* Update button text */}
            </div>
          </div>
        </div>
      </div>
      {/* Render Custom Alert */}
      {showAlert && <CustomAlert message={alertMessage} onClose={closeAlert} />}
    </div>
  );
}
