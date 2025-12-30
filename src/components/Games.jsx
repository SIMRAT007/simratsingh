import { useEffect, useState, useRef, useCallback } from 'react'

// Tic Tac Toe Game Component (vs Computer)
const TicTacToe = ({ onClose }) => {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [winner, setWinner] = useState(null)
  const [isThinking, setIsThinking] = useState(false)

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ]
    for (let [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a]
      }
    }
    return null
  }

  // Minimax AI for computer moves
  const minimax = (squares, isMaximizing) => {
    const result = calculateWinner(squares)
    if (result === 'O') return 10
    if (result === 'X') return -10
    if (squares.every(cell => cell !== null)) return 0

    if (isMaximizing) {
      let bestScore = -Infinity
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = 'O'
          const score = minimax(squares, false)
          squares[i] = null
          bestScore = Math.max(score, bestScore)
        }
      }
      return bestScore
    } else {
      let bestScore = Infinity
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = 'X'
          const score = minimax(squares, true)
          squares[i] = null
          bestScore = Math.min(score, bestScore)
        }
      }
      return bestScore
    }
  }

  const getBestMove = useCallback((squares) => {
    let bestScore = -Infinity
    let bestMove = null
    for (let i = 0; i < 9; i++) {
      if (squares[i] === null) {
        squares[i] = 'O'
        const score = minimax(squares, false)
        squares[i] = null
        if (score > bestScore) {
          bestScore = score
          bestMove = i
        }
      }
    }
    return bestMove
  }, [])

  // Computer's turn
  useEffect(() => {
    if (!isPlayerTurn && !winner && !board.every(cell => cell !== null)) {
      setIsThinking(true)
      const timer = setTimeout(() => {
        const newBoard = [...board]
        const move = getBestMove(newBoard)
        if (move !== null) {
          newBoard[move] = 'O'
          setBoard(newBoard)
          const gameWinner = calculateWinner(newBoard)
          if (gameWinner) setWinner(gameWinner)
        }
        setIsPlayerTurn(true)
        setIsThinking(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isPlayerTurn, board, winner, getBestMove])

  const handleClick = (index) => {
    if (board[index] || winner || !isPlayerTurn || isThinking) return
    const newBoard = [...board]
    newBoard[index] = 'X'
    setBoard(newBoard)
    const gameWinner = calculateWinner(newBoard)
    if (gameWinner) {
      setWinner(gameWinner)
    } else {
      setIsPlayerTurn(false)
    }
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setIsPlayerTurn(true)
    setWinner(null)
    setIsThinking(false)
  }

  const isDraw = !winner && board.every(cell => cell !== null)

  return (
    <div className="text-center">
      <h3 className="text-2xl font-bold text-black mb-2">Tic Tac Toe</h3>
      <p className="text-gray-500 text-sm mb-4">You (X) vs Computer (O)</p>
      
      {/* Game Status */}
      <div className="mb-6 h-8">
        {winner ? (
          <p className="text-xl font-semibold text-black">
            {winner === 'X' ? '🎉 You Win!' : '🤖 Computer Wins!'}
          </p>
        ) : isDraw ? (
          <p className="text-xl font-semibold text-gray-600">It's a Draw!</p>
        ) : isThinking ? (
          <p className="text-lg text-gray-600">🤔 Computer is thinking...</p>
        ) : (
          <p className="text-lg text-gray-600">Your turn</p>
        )}
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-3 gap-2 w-64 mx-auto mb-6">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            className={`w-20 h-20 text-3xl font-bold border-2 border-gray-300 flex items-center justify-center transition-all duration-200 ${
              cell ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'
            } ${cell === 'X' ? 'text-black' : 'text-gray-500'} ${
              !isPlayerTurn || isThinking ? 'cursor-not-allowed' : ''
            }`}
            disabled={!!cell || !!winner || !isPlayerTurn || isThinking}
          >
            {cell}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button
          onClick={resetGame}
          className="px-6 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-all duration-300"
        >
          New Game
        </button>
        <button
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 text-gray-700 font-medium hover:bg-black hover:text-white hover:border-black transition-all duration-300"
        >
          Close
        </button>
      </div>
    </div>
  )
}

// Memory Game Component
const MemoryGame = ({ onClose }) => {
  const emojis = ['🎮', '🎯', '🎨', '🚀', '💡', '⚡', '🔥', '✨']
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)

  useEffect(() => {
    initGame()
  }, [])

  const initGame = () => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji }))
    setCards(shuffled)
    setFlipped([])
    setMatched([])
    setMoves(0)
  }

  const handleCardClick = (id) => {
    if (flipped.length === 2 || flipped.includes(id) || matched.includes(id)) return
    
    const newFlipped = [...flipped, id]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(m => m + 1)
      const [first, second] = newFlipped
      if (cards[first].emoji === cards[second].emoji) {
        setMatched([...matched, first, second])
        setFlipped([])
      } else {
        setTimeout(() => setFlipped([]), 1000)
      }
    }
  }

  const isWon = matched.length === cards.length && cards.length > 0

  return (
    <div className="text-center">
      <h3 className="text-2xl font-bold text-black mb-4">Memory Game</h3>
      
      {/* Game Stats */}
      <div className="flex justify-center gap-6 mb-6">
        <p className="text-gray-600">Moves: <span className="font-bold text-black">{moves}</span></p>
        <p className="text-gray-600">Matched: <span className="font-bold text-black">{matched.length / 2}/{emojis.length}</span></p>
      </div>

      {isWon && (
        <p className="text-xl font-semibold text-black mb-4">🎉 You Won in {moves} moves!</p>
      )}

      {/* Game Board */}
      <div className="grid grid-cols-4 gap-2 w-72 mx-auto mb-6">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`w-16 h-16 text-2xl border-2 flex items-center justify-center transition-all duration-300 ${
              flipped.includes(card.id) || matched.includes(card.id)
                ? 'bg-white border-gray-300'
                : 'bg-black border-black text-black'
            }`}
            disabled={matched.includes(card.id)}
          >
            {(flipped.includes(card.id) || matched.includes(card.id)) ? card.emoji : '?'}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button
          onClick={initGame}
          className="px-6 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-all duration-300"
        >
          New Game
        </button>
        <button
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 text-gray-700 font-medium hover:bg-black hover:text-white hover:border-black transition-all duration-300"
        >
          Close
        </button>
      </div>
    </div>
  )
}

// Word Riddles Game Component
const WordRiddlesGame = ({ onClose }) => {
  const riddles = [
    { question: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?", answer: "map", hint: "You use it to find places" },
    { question: "What has keys but no locks, space but no room, and you can enter but can't go inside?", answer: "keyboard", hint: "You're probably using one right now" },
    { question: "I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I?", answer: "echo", hint: "Sound bouncing back" },
    { question: "The more you take, the more you leave behind. What am I?", answer: "footsteps", hint: "You make them when you walk" },
    { question: "I can be cracked, made, told, and played. What am I?", answer: "joke", hint: "Something that makes you laugh" },
    { question: "What has a head and a tail but no body?", answer: "coin", hint: "You flip it to make decisions" },
    { question: "I have hands but cannot clap. What am I?", answer: "clock", hint: "It tells you when to wake up" },
    { question: "What gets wetter the more it dries?", answer: "towel", hint: "You use it after a shower" },
    { question: "I have teeth but cannot bite. What am I?", answer: "comb", hint: "It goes through your hair" },
    { question: "What can travel around the world while staying in a corner?", answer: "stamp", hint: "You put it on letters" },
    { question: "I'm tall when I'm young and short when I'm old. What am I?", answer: "candle", hint: "It provides light and melts" },
    { question: "What has one eye but cannot see?", answer: "needle", hint: "Used for sewing" },
    { question: "What can you catch but never throw?", answer: "cold", hint: "You get it when you're sick" },
    { question: "What has a neck but no head?", answer: "bottle", hint: "You drink from it" },
    { question: "What can fill a room but takes up no space?", answer: "light", hint: "You turn it on when it's dark" },
    { question: "I have legs but cannot walk. What am I?", answer: "table", hint: "You eat meals on it" },
    { question: "What has words but never speaks?", answer: "book", hint: "You read it" },
    { question: "What runs but never walks, has a mouth but never talks?", answer: "river", hint: "A body of flowing water" },
    { question: "What can you break without touching it?", answer: "promise", hint: "Something you make and keep" },
    { question: "What has ears but cannot hear?", answer: "corn", hint: "A yellow vegetable" },
    { question: "What goes up but never comes down?", answer: "age", hint: "Everyone has it and it increases yearly" },
    { question: "What has a thumb and four fingers but is not alive?", answer: "glove", hint: "You wear it on your hand in winter" },
    { question: "What is always in front of you but can't be seen?", answer: "future", hint: "It hasn't happened yet" },
    { question: "What can you hold in your right hand but never in your left?", answer: "left hand", hint: "Think about body parts" },
    { question: "What begins with T, ends with T, and has T in it?", answer: "teapot", hint: "You brew tea in it" },
    { question: "What has many rings but no fingers?", answer: "telephone", hint: "You use it to call people" },
    { question: "What building has the most stories?", answer: "library", hint: "Books are found here" },
    { question: "What invention lets you look right through a wall?", answer: "window", hint: "Made of glass" },
    { question: "What word is spelled incorrectly in every dictionary?", answer: "incorrectly", hint: "Read the question carefully" },
    { question: "What has a bottom at the top?", answer: "legs", hint: "Body parts you walk with" },
    { question: "What comes once in a minute, twice in a moment, but never in a thousand years?", answer: "m", hint: "It's a letter" },
    { question: "What has branches but no fruit, trunk, or leaves?", answer: "bank", hint: "You keep money there" },
    { question: "I am not alive, but I grow. I don't have lungs, but I need air. What am I?", answer: "fire", hint: "It burns" },
    { question: "What can be broken but is never held?", answer: "heart", hint: "Related to feelings" },
    { question: "What disappears as soon as you say its name?", answer: "silence", hint: "The absence of sound" },
    { question: "What starts with an E, ends with an E, but only contains one letter?", answer: "envelope", hint: "You mail things in it" },
    { question: "I shave every day, but my beard stays the same. What am I?", answer: "barber", hint: "A profession" },
    { question: "What belongs to you but is used more by others?", answer: "name", hint: "People call you by it" },
    { question: "What five-letter word becomes shorter when you add two letters?", answer: "short", hint: "The opposite of long" },
    { question: "What goes through cities and fields but never moves?", answer: "road", hint: "Cars drive on it" },
    { question: "I have branches, but no fruit, leaves, or trunk. What am I?", answer: "bank", hint: "Where money is stored" },
    { question: "What kind of room has no doors or windows?", answer: "mushroom", hint: "It's edible" },
    { question: "What can run but never walks, murmurs but never talks?", answer: "water", hint: "Essential for life" },
    { question: "What has four wheels and flies?", answer: "garbage truck", hint: "It collects trash" },
    { question: "What gets broken without being held?", answer: "promise", hint: "Something you commit to" },
    { question: "What can you keep after giving it to someone?", answer: "word", hint: "Related to promises" },
    { question: "What is seen in the middle of March and April but not at the beginning or end?", answer: "r", hint: "A letter in the alphabet" },
    { question: "What has a ring but no finger?", answer: "phone", hint: "You answer it when it makes a sound" },
    { question: "What loses its head in the morning and gets it back at night?", answer: "pillow", hint: "You sleep on it" },
  ]

  const [currentRiddle, setCurrentRiddle] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [result, setResult] = useState(null) // 'correct', 'wrong', null
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState([])

  const checkAnswer = () => {
    const correct = userAnswer.toLowerCase().trim() === riddles[currentRiddle].answer.toLowerCase()
    setResult(correct ? 'correct' : 'wrong')
    
    if (correct && !answered.includes(currentRiddle)) {
      setScore(s => s + (showHint ? 5 : 10))
      setAnswered([...answered, currentRiddle])
    }
  }

  const nextRiddle = () => {
    setCurrentRiddle((prev) => (prev + 1) % riddles.length)
    setUserAnswer('')
    setShowHint(false)
    setResult(null)
  }

  const skipRiddle = () => {
    nextRiddle()
  }

  const resetGame = () => {
    setCurrentRiddle(0)
    setUserAnswer('')
    setShowHint(false)
    setResult(null)
    setScore(0)
    setAnswered([])
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && userAnswer.trim()) {
      checkAnswer()
    }
  }

  return (
    <div className="text-center">
      <h3 className="text-2xl font-bold text-black mb-2">Word Riddles</h3>
      <p className="text-gray-500 text-sm mb-4">Solve the riddles! Get 10 points for each correct answer (5 with hint).</p>
      
      {/* Stats */}
      <div className="flex justify-center gap-6 mb-4">
        <p className="text-gray-600">Score: <span className="font-bold text-black">{score}</span></p>
        <p className="text-gray-600">Riddle: <span className="font-bold text-black">{currentRiddle + 1}/{riddles.length}</span></p>
      </div>

      {/* Riddle Card */}
      <div className="bg-gray-100 p-6 mb-4 min-h-[120px] flex items-center justify-center">
        <p className="text-gray-800 text-lg leading-relaxed">
          {riddles[currentRiddle].question}
        </p>
      </div>

      {/* Hint */}
      {showHint && (
        <p className="text-yellow-600 text-sm mb-4 bg-yellow-50 p-2">
          💡 Hint: {riddles[currentRiddle].hint}
        </p>
      )}

      {/* Result */}
      {result && (
        <div className={`mb-4 p-3 ${result === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {result === 'correct' ? (
            <p>🎉 Correct! +{showHint ? 5 : 10} points</p>
          ) : (
            <p>❌ Wrong! The answer was: <strong>{riddles[currentRiddle].answer}</strong></p>
          )}
        </div>
      )}

      {/* Input */}
      {!result && (
        <div className="mb-4">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your answer..."
            className="w-full px-4 py-3 border-2 border-gray-300 focus:border-black focus:outline-none transition-colors text-center"
            autoFocus
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-3 mb-4 flex-wrap">
        {!result ? (
          <>
            <button
              onClick={checkAnswer}
              disabled={!userAnswer.trim()}
              className="px-5 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
            {!showHint && (
              <button
                onClick={() => setShowHint(true)}
                className="px-5 py-2 border border-yellow-500 text-yellow-600 font-medium hover:bg-yellow-500 hover:text-white transition-all duration-300"
              >
                Show Hint
              </button>
            )}
            <button
              onClick={skipRiddle}
              className="px-5 py-2 border border-gray-300 text-gray-600 font-medium hover:bg-gray-100 transition-all duration-300"
            >
              Skip
            </button>
          </>
        ) : (
          <button
            onClick={nextRiddle}
            className="px-6 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-all duration-300"
          >
            Next Riddle →
          </button>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex justify-center gap-4 pt-4 border-t border-gray-200">
        <button
          onClick={resetGame}
          className="px-6 py-2 bg-gray-800 text-white font-medium hover:bg-black transition-all duration-300"
        >
          Reset
        </button>
        <button
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 text-gray-700 font-medium hover:bg-black hover:text-white hover:border-black transition-all duration-300"
        >
          Close
        </button>
      </div>
    </div>
  )
}

// Main Games Section
const Games = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [activeGame, setActiveGame] = useState(null)
  const sectionRef = useRef(null)

  const games = [
    {
      id: 'tictactoe',
      name: 'Tic Tac Toe',
      description: 'Challenge the computer in this classic game!',
      icon: '⭕',
    },
    {
      id: 'memory',
      name: 'Memory Game',
      description: 'Match the pairs. Test your memory!',
      icon: '🧠',
    },
    {
      id: 'riddles',
      name: 'Word Riddles',
      description: 'Test your brain with fun riddles!',
      icon: '🧩',
    },
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (activeGame) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [activeGame])

  const renderGame = () => {
    switch (activeGame) {
      case 'tictactoe':
        return <TicTacToe onClose={() => setActiveGame(null)} />
      case 'memory':
        return <MemoryGame onClose={() => setActiveGame(null)} />
      case 'riddles':
        return <WordRiddlesGame onClose={() => setActiveGame(null)} />
      default:
        return null
    }
  }

  return (
    <>
      <section
        ref={sectionRef}
        id="games"
        className="py-20 bg-black text-white relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div
            className={`text-center mb-16 transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <p className="text-gray-500 text-sm uppercase tracking-widest mb-4">Take a Break</p>
            <h2 className="text-4xl md:text-5xl font-bold">
              Play Some <span className="text-gray-500">Games</span>
            </h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto">
              Take a moment to relax and have some fun with these classic games!
            </p>
          </div>

          {/* Games Grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {games.map((game, index) => (
              <button
                key={game.id}
                onClick={() => setActiveGame(game.id)}
                className={`group p-8 border border-gray-800 bg-gray-900/50 hover:bg-white hover:border-white text-left transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${0.2 + index * 0.1}s` }}
              >
                {/* Icon */}
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {game.icon}
                </div>

                {/* Name */}
                <h3 className="text-xl font-semibold text-white group-hover:text-black mb-2 transition-colors">
                  {game.name}
                </h3>

                {/* Description */}
                <p className="text-gray-500 text-sm group-hover:text-gray-600 transition-colors">
                  {game.description}
                </p>

                {/* Play Button */}
                <div className="flex items-center mt-4 text-sm font-medium text-white group-hover:text-black transition-all duration-300">
                  <span>Play Now</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Game Modal */}
      {activeGame && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setActiveGame(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Modal Content */}
          <div
            className="relative bg-white w-full max-w-md p-8 rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveGame(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Game Content */}
            {renderGame()}
          </div>
        </div>
      )}
    </>
  )
}

export default Games

