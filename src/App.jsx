/* eslint-disable react-hooks/immutability */
import { useMemo, useState } from 'react'
import './App.css'

const startMoney = 15000
const passStartBonus = 2000
const board = [
  { type: 'start', name: '起点', note: '经过奖励 2000' },
  { type: 'city', name: '天津', province: '京津冀', price: 600, toll: 20, build: 500, rents: [20, 100, 300, 900] },
  { type: 'city', name: '北京', province: '京津冀', price: 1000, toll: 60, build: 500, rents: [60, 300, 900, 2700] },
  { type: 'chance', name: '机会', note: '抽一张卡' },
  { type: 'fuel', name: '加油站', price: 2000, note: '可购买' },
  { type: 'city', name: '杭州', province: '长三角', price: 1800, toll: 140, build: 1000, rents: [140, 700, 2000, 5500] },
  { type: 'city', name: '上海', province: '长三角', price: 4000, toll: 500, build: 2000, rents: [500, 2000, 6000, 14000] },
  { type: 'city', name: '南京', province: '长三角', price: 1600, toll: 120, build: 1000, rents: [120, 600, 1800, 5000] },
  { type: 'goJail', name: '去监狱', note: '直接前往监狱' },
  { type: 'chance', name: '命运', note: '随机事件' },
  { type: 'city', name: '长沙', province: '华中', price: 1400, toll: 100, build: 750, rents: [100, 500, 1500, 4500] },
  { type: 'city', name: '武汉', province: '华中', price: 1600, toll: 120, build: 750, rents: [120, 600, 1800, 5000] },
  { type: 'station', name: '高铁站', price: 2000, note: '可购买' },
  { type: 'tax', name: '缴税', amount: 2000, note: '支付税费' },
  { type: 'city', name: '重庆', province: '西南', price: 1800, toll: 140, build: 1000, rents: [140, 700, 2000, 5500] },
  { type: 'city', name: '成都', province: '西南', price: 2000, toll: 160, build: 1000, rents: [160, 800, 2200, 6000] },
  { type: 'bonus', name: '补贴站', amount: 1000, note: '获得补贴' },
  { type: 'chance', name: '好运', note: '抽一张卡' },
  { type: 'city', name: '兰州', province: '西北', price: 1000, toll: 60, build: 500, rents: [60, 300, 900, 2700] },
  { type: 'city', name: '西安', province: '西北', price: 1200, toll: 80, build: 500, rents: [80, 400, 1000, 3000] },
  { type: 'tax', name: '维修费', amount: 1000, note: '支付维修费' },
  { type: 'jail', name: '监狱', note: '到访或等待' },
  { type: 'city', name: '广州', province: '珠三角', price: 3000, toll: 260, build: 1500, rents: [260, 1300, 3900, 9000] },
  { type: 'city', name: '深圳', province: '珠三角', price: 3600, toll: 400, build: 2000, rents: [400, 1800, 5000, 11000] },
  { type: 'airport', name: '飞机场', price: 2000, note: '可购买' },
  { type: 'city', name: '福州', province: '东南', price: 2200, toll: 180, build: 1000, rents: [180, 900, 2500, 7000] },
  { type: 'city', name: '厦门', province: '东南', price: 2600, toll: 220, build: 1500, rents: [220, 1100, 3300, 8000] },
  { type: 'chance', name: '机会', note: '抽一张卡' },
]

const jailIndex = board.findIndex((tile) => tile.type === 'jail')
const transportTypes = ['fuel', 'station', 'airport']

const chanceCards = [
  { text: '旅游旺季，获得补贴 1200 元', money: 1200 },
  { text: '城市建设投资，支付 1000 元', money: -1000 },
  { text: '夜市爆火，获得 1500 元', money: 1500 },
  { text: '道路施工绕行，支付 800 元', money: -800 },
  { text: '银行分红，获得 1000 元', money: 1000 },
  { text: '收到每位玩家 500 元红包', collectFromEach: 500 },
  { text: '请所有玩家喝奶茶，给每人 300 元', payEach: 300 },
  { text: '拿到一张免监狱卡', jailFree: 1 },
  { text: '城市广告爆火，获得 2000 元', money: 2000 },
  { text: '临时维修道路，支付 1500 元', money: -1500 },
  { text: '朋友赞助，获得 900 元', money: 900 },
  { text: '公益捐款，给每位玩家 200 元', payEach: 200 },
]

const playerPresets = [
  { name: '红方', shortName: '红', color: 'red' },
  { name: '蓝方', shortName: '蓝', color: 'blue' },
  { name: '绿方', shortName: '绿', color: 'green' },
  { name: '紫方', shortName: '紫', color: 'purple' },
]
const playerColors = playerPresets.map((player) => player.color)

const provinceColors = {
  京津冀: '#b7791f',
  长三角: '#2f855a',
  华中: '#d69e2e',
  西南: '#805ad5',
  西北: '#718096',
  珠三角: '#dd6b20',
  东南: '#319795',
}

function App() {
  const [playerCount, setPlayerCount] = useState(2)
  const [gameStarted, setGameStarted] = useState(false)
  const [players, setPlayers] = useState(createPlayers(2))
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [dice, setDice] = useState(1)
  const [properties, setProperties] = useState({})
  const [hasRolled, setHasRolled] = useState(false)
  const [isMoving, setIsMoving] = useState(false)
  const [isRollingDice, setIsRollingDice] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [showBuildChoices, setShowBuildChoices] = useState(false)
  const [showSellChoices, setShowSellChoices] = useState(false)
  const [showTrade, setShowTrade] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(1)
  const [winner, setWinner] = useState(null)
  const [message, setMessage] = useState('选择人数后开始游戏。')
  const [, setLogs] = useState(['上海、深圳、北京等现实高房价城市更贵；买齐同色地区后才能建房。'])

  const currentPlayer = players[currentPlayerIndex]
  const currentTile = board[currentPlayer.position]
  const selectedTile = board[selectedIndex]
  const provinceStatus = useMemo(() => getAllProvinceStatus(properties, players.length), [properties, players.length])
  const currentOwner = properties[currentTile.name]?.owner
  const selectedOwner = properties[selectedTile.name]?.owner
  const ownsSelectedTile = selectedOwner === currentPlayerIndex
  const ownsSelectedProvince =
    selectedTile.type === 'city' &&
    getProvinceStatus(properties, selectedTile.province, currentPlayerIndex).complete
  const isInDebt = currentPlayer.money < 0
  const buildableCities = getBuildableCities(properties, currentPlayerIndex, currentPlayer.money)
  const sellableCities = getSellableCities(properties, currentPlayerIndex)
  const buildableCityNames = buildableCities.map((city) => city.name)
  const canBuy =
    !winner &&
    !isMoving &&
    !isRollingDice &&
    !isInDebt &&
    isBuyableTile(currentTile) &&
    currentOwner === undefined &&
    currentPlayer.money >= getBuyPrice(currentTile)
  const canOpenBuildChoices = !winner && !isMoving && !isRollingDice && !isInDebt && buildableCities.length > 0
  const canEndTurn = hasRolled && !winner && !isInDebt && !isMoving && !isRollingDice
  const canSellHouse = !winner && !isMoving && !isRollingDice && sellableCities.length > 0
  const canTrade = !winner && !isMoving && !isRollingDice && !isInDebt && getActivePlayers(players).length > 1

  function addLog(text) {
    setLogs((oldLogs) => [text, ...oldLogs].slice(0, 6))
  }

  function resetGame(count = playerCount, shouldStart = true) {
    const nextPlayers = createPlayers(count)
    setPlayerCount(count)
    setPlayers(nextPlayers)
    setCurrentPlayerIndex(0)
    setDice(1)
    setProperties({})
    setHasRolled(false)
    setIsMoving(false)
    setIsRollingDice(false)
    setShowBuildChoices(false)
    setShowSellChoices(false)
    setShowTrade(false)
    setSelectedIndex(1)
    setWinner(null)
    setGameStarted(shouldStart)
    setMessage(`${nextPlayers[0].name}先走。点击城市可查看过路费表。`)
    setLogs(['上海、深圳、北京等现实高房价城市更贵；买齐同色地区后才能建房。'])
  }

  function resolveMoney(currentPlayers, playerIndex, amount, currentProperties = properties) {
    const nextPlayers = currentPlayers.map((player, index) =>
      index === playerIndex ? { ...player, money: player.money + amount } : player,
    )
    return checkBankruptcy(nextPlayers, currentProperties, playerIndex)
  }

  function applyChanceCard(card, playerIndex) {
    let extraText = card.text
    let jailFreeCards = 0
    let moneyDeltas = Array(players.length).fill(0)

    if (card.money) {
      moneyDeltas = addMoneyDelta(moneyDeltas, playerIndex, card.money)
    }

    if (card.collectFromEach) {
      players.forEach((player, index) => {
        if (index !== playerIndex && !player.bankrupt) {
          moneyDeltas = addMoneyDelta(moneyDeltas, index, -card.collectFromEach)
          moneyDeltas = addMoneyDelta(moneyDeltas, playerIndex, card.collectFromEach)
        }
      })
    }

    if (card.payEach) {
      players.forEach((player, index) => {
        if (index !== playerIndex && !player.bankrupt) {
          moneyDeltas = addMoneyDelta(moneyDeltas, index, card.payEach)
          moneyDeltas = addMoneyDelta(moneyDeltas, playerIndex, -card.payEach)
        }
      })
    }

    if (card.jailFree) {
      jailFreeCards += card.jailFree
      extraText += '，以后遇到去监狱可自动抵消一次'
    }

    return { extraText, jailFreeCards, moneyDeltas }
  }

  async function rollDice() {
    if (winner) return
    if (isMoving || isRollingDice) return
    if (isInDebt) {
      setMessage(`${currentPlayer.name} 负债中，需要先卖房还钱。`)
      return
    }
    if (hasRolled) {
      setMessage('这一回合已经掷过骰子了，可以买地、建房、交易，然后结束回合。')
      return
    }

    const number = Math.floor(Math.random() * 6) + 1
    const startPosition = currentPlayer.position
    let nextPosition = startPosition
    const passedStart = startPosition + number >= board.length
    let text = `${currentPlayer.name} 掷出 ${number}`
    const moneyChanges = new Map()
    const addRollMoney = (playerIndex, amount) => {
      moneyChanges.set(playerIndex, (moneyChanges.get(playerIndex) || 0) + amount)
    }
    let jailFreeCardChange = 0

    setHasRolled(true)
    setIsRollingDice(true)
    setMessage(`${currentPlayer.name} 正在掷骰子...`)
    await sleep(220)
    setDice(number)
    setMessage(`${currentPlayer.name} 掷出 ${number}，开始移动...`)
    await sleep(120)
    setIsMoving(true)
    setIsRollingDice(false)

    for (let step = 1; step <= number; step += 1) {
      nextPosition = (startPosition + step) % board.length
      setPlayers((currentPlayers) =>
        currentPlayers.map((player, index) =>
          index === currentPlayerIndex ? { ...player, position: nextPosition } : player,
        ),
      )
      setSelectedIndex(nextPosition)
      await sleep(260)
    }

    let tile = board[nextPosition]
    text += `，来到 ${tile.name}`

    if (passedStart) {
      addRollMoney(currentPlayerIndex, passStartBonus)
      text += `，经过起点获得 ${passStartBonus} 元`
    }

    if (tile.type === 'goJail') {
      if (currentPlayer.jailFreeCards > 0) {
        jailFreeCardChange -= 1
        text += '，使用免监狱卡，没有进监狱'
      } else {
        nextPosition = jailIndex
        tile = board[nextPosition]
        setPlayers((currentPlayers) =>
          currentPlayers.map((player, index) =>
            index === currentPlayerIndex ? { ...player, position: nextPosition } : player,
          ),
        )
        setSelectedIndex(nextPosition)
        await sleep(280)
        text += '，被送往监狱'
      }
    }

    const tileMoney = getTileMoneyChange(tile)
    if (tileMoney !== 0) {
      addRollMoney(currentPlayerIndex, tileMoney)
      text += tileMoney > 0 ? `，获得 ${tileMoney} 元` : `，支付 ${Math.abs(tileMoney)} 元`
    }

    if (tile.type === 'chance') {
      const card = chanceCards[Math.floor(Math.random() * chanceCards.length)]
      const chanceResult = applyChanceCard(card, currentPlayerIndex)
      chanceResult.moneyDeltas.forEach((amount, index) => addRollMoney(index, amount))
      jailFreeCardChange += chanceResult.jailFreeCards
      text += `，${chanceResult.extraText}`
    }

    const landedProperty = properties[tile.name]
    if (tile.type === 'city' && landedProperty && landedProperty.owner !== currentPlayerIndex) {
      const status = getProvinceStatus(properties, tile.province, landedProperty.owner)
      const toll = getToll(tile, landedProperty.houses, status.complete)
      addRollMoney(currentPlayerIndex, -toll)
      addRollMoney(landedProperty.owner, toll)
      text += `，向${players[landedProperty.owner].name}支付过路费 ${toll} 元`
    }

    if (isTransportTile(tile) && landedProperty && landedProperty.owner !== currentPlayerIndex) {
      const toll = getTransportToll(properties, landedProperty.owner, number)
      addRollMoney(currentPlayerIndex, -toll)
      addRollMoney(landedProperty.owner, toll)
      text += `，向${players[landedProperty.owner].name}支付交通过路费 ${toll} 元`
    }

    let nextPlayers = players.map((player, index) => {
      const movedPlayer =
        index === currentPlayerIndex ? { ...player, position: nextPosition } : player
      const jailFreeCards = index === currentPlayerIndex
        ? Math.max(0, movedPlayer.jailFreeCards + jailFreeCardChange)
        : movedPlayer.jailFreeCards
      return { ...movedPlayer, jailFreeCards, money: movedPlayer.money + (moneyChanges.get(index) || 0) }
    })

    const bankruptcy = checkBankruptcies(nextPlayers, properties)
    nextPlayers = bankruptcy.players

    setSelectedIndex(nextPosition)
    setPlayers(nextPlayers)
    setWinner(bankruptcy.winner)
    setIsMoving(false)
    if (bankruptcy.winner !== null) {
      text += `。${players[currentPlayerIndex].name} 扣不起钱，${nextPlayers[bankruptcy.winner].name} 获胜。`
    } else if (nextPlayers[currentPlayerIndex].bankrupt) {
      text += `。${players[currentPlayerIndex].name} 破产出局。`
    } else if (nextPlayers[currentPlayerIndex].money < 0) {
      text += '。资金为负，需要卖房还钱，不能结束回合。'
    }
    setMessage(text)
    addLog(text)
  }

  function buyCity() {
    if (!canBuy) {
      setMessage('这格不能购买，或者资金不够。')
      return
    }

    const nextProperties = {
      ...properties,
      [currentTile.name]: {
        owner: currentPlayerIndex,
        houses: 0,
      },
    }
    const price = getBuyPrice(currentTile)
    setProperties(nextProperties)
    setPlayers(resolveMoney(players, currentPlayerIndex, -price, nextProperties).players)
    setSelectedIndex(currentPlayer.position)
    const text = `${currentPlayer.name} 买下 ${currentTile.name}，花费 ${price} 元。`
    setMessage(text)
    addLog(text)
  }

  function buildHouse() {
    if (canOpenBuildChoices) {
      setShowBuildChoices(true)
      setMessage('请选择要建房的城市，棋盘上发光的城市都可以建房。')
      return
    }

    if (selectedTile.type === 'city' && ownsSelectedTile && !ownsSelectedProvince) {
      setMessage(`要先买齐${selectedTile.province}全部城市，才能在这里建房。`)
    } else if (selectedTile.type === 'city' && !ownsSelectedTile) {
      setMessage('只能给自己买下的城市建房。')
    } else {
      setMessage('现在没有可以建房的城市，可能是资金不够或房子已经满 3 间。')
    }
  }

  function confirmBuild(cityName) {
    const city = board.find((tile) => tile.name === cityName)
    const property = properties[cityName]
    const canBuildHere = buildableCityNames.includes(cityName)

    if (!city || !property || !canBuildHere) {
      setMessage('这个城市现在不能建房。')
      return
    }

    const cost = getBuildCost(city)
    const nextProperties = {
      ...properties,
      [cityName]: {
        ...properties[cityName],
        houses: properties[cityName].houses + 1,
      },
    }
    const bankruptcy = resolveMoney(players, currentPlayerIndex, -cost, nextProperties)
    setProperties(nextProperties)
    setPlayers(bankruptcy.players)
    setWinner(bankruptcy.winner)
    setSelectedIndex(board.findIndex((tile) => tile.name === cityName))
    setShowBuildChoices(false)
    const text = `${currentPlayer.name} 给 ${cityName} 建房，花费 ${cost} 元。`
    setMessage(text)
    addLog(text)
  }

  function sellHouse() {
    if (!canSellHouse) return
    setShowSellChoices(true)
    setMessage('请选择要卖掉的城市。卖出价格会比买入价格低 500-600 元。')
  }

  function confirmSellCity(cityName) {
    const city = board.find((tile) => tile.name === cityName)
    const property = properties[cityName]

    if (!city || property?.owner !== currentPlayerIndex) {
      setMessage('只能卖掉自己已经买下的城市。')
      return
    }

    const refund = getSaleValue(city)
    const lost = city.price - refund
    const nextProperties = { ...properties }
    delete nextProperties[cityName]
    const nextPlayers = players.map((player, index) =>
      index === currentPlayerIndex ? { ...player, money: player.money + refund } : player,
    )
    const bankruptcy = checkBankruptcy(nextPlayers, nextProperties, currentPlayerIndex)
    const text =
      bankruptcy.winner === null
        ? `${currentPlayer.name} 卖掉 ${cityName}，收回 ${refund} 元，比买入价少 ${lost} 元。`
        : `${currentPlayer.name} 卖掉 ${cityName} 后仍然还不起，${bankruptcy.players[bankruptcy.winner].name} 获胜。`

    setProperties(nextProperties)
    setPlayers(bankruptcy.players)
    setWinner(bankruptcy.winner)
    setSelectedIndex(board.findIndex((tile) => tile.name === cityName))
    setShowSellChoices(false)
    setMessage(text)
    addLog(text)
  }

  function confirmTrade({ amount, cityName, mode, targetIndex }) {
    const city = board.find((tile) => tile.name === cityName)
    const property = properties[cityName]
    const money = Number(amount)
    const buyerIndex = mode === 'buy' ? currentPlayerIndex : targetIndex
    const sellerIndex = mode === 'buy' ? targetIndex : currentPlayerIndex

    if (!city || !property || property.owner !== sellerIndex || Number.isNaN(money) || money <= 0) {
      setMessage('交易内容不完整，无法成交。')
      return
    }
    if (players[buyerIndex].money < money) {
      setMessage(`${players[buyerIndex].name} 的钱不够，交易失败。`)
      return
    }

    const nextProperties = {
      ...properties,
      [cityName]: {
        ...property,
        owner: buyerIndex,
        houses: 0,
      },
    }
    const nextPlayers = players.map((player, index) => {
      if (index === buyerIndex) return { ...player, money: player.money - money }
      if (index === sellerIndex) return { ...player, money: player.money + money }
      return player
    })
    const bankruptcy = checkBankruptcy(nextPlayers, nextProperties, buyerIndex)
    const text =
      mode === 'buy'
        ? `${currentPlayer.name} 用 ${money} 元向 ${players[targetIndex].name} 买下 ${cityName}。`
        : `${currentPlayer.name} 把 ${cityName} 卖给 ${players[targetIndex].name}，收到 ${money} 元。`

    setProperties(nextProperties)
    setPlayers(bankruptcy.players)
    setWinner(bankruptcy.winner)
    setSelectedIndex(board.findIndex((tile) => tile.name === cityName))
    setShowTrade(false)
    setMessage(text)
    addLog(text)
  }

  function endTurn() {
    if (!canEndTurn) return
    const nextPlayerIndex = getNextActivePlayerIndex(players, currentPlayerIndex)
    setCurrentPlayerIndex(nextPlayerIndex)
    setHasRolled(false)
    setMessage(`轮到 ${players[nextPlayerIndex].name}。`)
  }

  function restartGame() {
    resetGame(players.length, true)
  }

  if (!gameStarted) {
    return <StartScreen playerCount={playerCount} setPlayerCount={setPlayerCount} onStart={() => resetGame(playerCount, true)} />
  }

  return (
    <main className="game">
      <section className="topbar">
        <div>
          <p className="eyebrow">China Monopoly Demo</p>
          <h1>中国城市大富翁</h1>
        </div>
        <div className="top-actions">
          <button type="button" onClick={() => setShowRules(true)}>
            怎么玩
          </button>
          <button type="button" onClick={() => setShowTrade(true)} disabled={!canTrade}>
            玩家交易
          </button>
          <button type="button" onClick={() => resetGame(playerCount, false)} disabled={isMoving || isRollingDice}>
            选择人数
          </button>
          <button type="button" onClick={restartGame} disabled={isMoving || isRollingDice}>
            重新开始
          </button>
        </div>
        <div className="stats">
          {players.map((player, index) => (
            <Stat
              active={index === currentPlayerIndex && !player.bankrupt}
              key={player.name}
              label={player.name}
              value={player.bankrupt ? '出局' : `${player.money} 元`}
            />
          ))}
        </div>
      </section>

      <section className="board-wrap">
        <section className="map-board" aria-label="长方形大富翁地图">
          {board.map((tile, index) => (
            <Tile
              key={`${tile.name}-${index}`}
              index={index}
              isSelected={selectedIndex === index}
              onSelect={() => setSelectedIndex(index)}
              property={properties[tile.name]}
              provinceStatus={provinceStatus}
              tile={tile}
              players={players}
              isBuildable={showBuildChoices && buildableCityNames.includes(tile.name)}
            />
          ))}

          <section className="center-panel">
            <div className="turn-card">
              <span>当前回合</span>
              <strong className={playerColors[currentPlayerIndex]}>{currentPlayer.name}</strong>
              <small>{winner === null ? getTileDescription(currentTile, properties) : `${players[winner].name} 获胜`}</small>
            </div>

            <Dice disabled={winner !== null || isInDebt || isMoving || isRollingDice} isRolling={isRollingDice} onRoll={rollDice} value={dice} />

            <div className="controls">
              <button type="button" onClick={buyCity} disabled={!canBuy}>
                买下资产
              </button>
              <button type="button" onClick={buildHouse} disabled={!canOpenBuildChoices}>
                建房升级
              </button>
              <button type="button" onClick={sellHouse} disabled={!canSellHouse}>
                卖房还钱
              </button>
              <button type="button" onClick={() => setShowTrade(true)} disabled={!canTrade}>
                玩家交易
              </button>
              <button type="button" className="end-turn" onClick={endTurn} disabled={!canEndTurn}>
                结束回合
              </button>
            </div>

            <p className={isInDebt ? 'message debt' : 'message'}>{message}</p>

            <CityDetail
              playerNames={players.map((player) => player.name)}
              property={properties[selectedTile.name]}
              properties={properties}
              provinceStatus={provinceStatus}
              tile={selectedTile}
            />

            <AssetSummary players={players} properties={properties} />
          </section>
        </section>
      </section>

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      {showBuildChoices && (
        <ChoiceModal
          moneyLabel="花费"
          emptyText="现在没有可以建房的城市。"
          items={buildableCities.map((city) => ({
            name: city.name,
            meta: city.province,
            price: getBuildCost(city),
            detail: `已有 ${properties[city.name].houses} 间房`,
          }))}
          onChoose={confirmBuild}
          onClose={() => setShowBuildChoices(false)}
          title="选择建房城市"
        />
      )}
      {showSellChoices && (
        <ChoiceModal
          moneyLabel="收回"
          emptyText="现在没有可以卖掉的城市。"
          items={sellableCities.map((city) => ({
            name: city.name,
            meta: city.province,
            price: getSaleValue(city),
            detail: `买价 ${city.price} 元，少收 ${city.price - getSaleValue(city)} 元`,
          }))}
          onChoose={confirmSellCity}
          onClose={() => setShowSellChoices(false)}
          title="选择卖掉的城市"
        />
      )}
      {showTrade && (
        <TradeModal
          currentPlayerIndex={currentPlayerIndex}
          onClose={() => setShowTrade(false)}
          onTrade={confirmTrade}
          players={players}
          properties={properties}
        />
      )}
    </main>
  )
}

function StartScreen({ onStart, playerCount, setPlayerCount }) {
  return (
    <main className="start-screen">
      <section className="start-card">
        <p className="eyebrow">China Monopoly Demo</p>
        <h1>选择玩家人数</h1>
        <p className="start-copy">2 到 4 人都可以玩。每位玩家从 15000 元开始，沿着中国城市地图买地、建房、收过路费，也可以互相交易。</p>
        <div className="player-count-picker" role="group" aria-label="选择玩家人数">
          {[2, 3, 4].map((count) => (
            <button
              className={playerCount === count ? 'selected' : ''}
              key={count}
              onClick={() => setPlayerCount(count)}
              type="button"
            >
              <strong>{count}</strong>
              <span>{count} 人局</span>
            </button>
          ))}
        </div>
        <div className="start-preview">
          {playerPresets.slice(0, playerCount).map((player) => (
            <span className={player.color} key={player.name}>{player.name}</span>
          ))}
        </div>
        <button className="start-button" onClick={onStart} type="button">开始游戏</button>
      </section>
    </main>
  )
}

function Tile({ index, isBuildable, isSelected, onSelect, property, provinceStatus, tile, players }) {
  const gridPosition = getGridPosition(index)
  const tileStyle =
    tile.type === 'city'
      ? { ...gridPosition, '--province-color': getProvinceColor(tile.province) }
      : isTransportTile(tile)
        ? { ...gridPosition, '--province-color': '#3b82f6' }
        : gridPosition
  const playerIndexes = players
    .map((player, playerIndex) => (!player.bankrupt && player.position === index ? playerIndex : null))
    .filter((playerIndex) => playerIndex !== null)
  const owner = property ? players[property.owner] : null
  const status = tile.type === 'city' ? provinceStatus[tile.province] : null
  const ownerHasSet = property && status ? status.owners[property.owner]?.complete : false

  return (
    <button
      className={[
        'tile',
        tile.type,
        property ? 'owned' : '',
        ownerHasSet ? 'complete' : '',
        isBuildable ? 'buildable' : '',
        isSelected ? 'selected' : '',
      ].join(' ')}
      onClick={onSelect}
      style={tileStyle}
      type="button"
    >
      <div className="tile-head">
        <span>{tile.name}</span>
        <div className="tokens">
          {playerIndexes.map((playerIndex) => (
            <b className={playerColors[playerIndex]} key={playerIndex}>
              {players[playerIndex].shortName}
            </b>
          ))}
        </div>
      </div>

      {isBuyableTile(tile) ? (
        <>
          <small>{tile.type === 'city' ? tile.province : '交通资产'}</small>
          <p>买价 {getBuyPrice(tile)}</p>
          {tile.type === 'city' && owner && (
            <div className="houses" aria-label={`${property.houses} 间房`}>
              {Array.from({ length: property.houses }).map((_, houseIndex) => (
                <i className={playerColors[property.owner]} key={houseIndex} />
              ))}
            </div>
          )}
          {owner && (
            <div className={`owner-strip ${playerColors[property.owner]}`}>
              {owner.shortName}
            </div>
          )}
        </>
      ) : (
        <small>{tile.note}</small>
      )}
    </button>
  )
}

function AssetSummary({ players, properties }) {
  return (
    <div className="asset-summary" aria-label="玩家资产概览">
      {players.map((player) => {
        const assets = getPlayerAssets(properties, player.id)

        return (
          <article className={'asset-card ' + player.color} key={player.name}>
            <div className="asset-owner">
              <b className={player.color}>{player.shortName}</b>
              <strong>{player.name}</strong>
            </div>
            <div className="asset-counts">
              <span title="城市数量">
                <i className="asset-icon city-icon" />
                {assets.cityCount}
              </span>
              <span title="房子数量">
                <i className="asset-icon house-icon" />
                {assets.houseCount}
              </span>
            </div>
            <div className="asset-cities" aria-label="城市地区颜色">
              {assets.cities.length > 0 ? (
                assets.cities.map((city) => (
                  <i
                    key={city.name}
                    style={{ '--city-color': getProvinceColor(city.province) }}
                    title={city.name + ' / ' + city.province}
                  >
                    {city.name.slice(0, 1)}
                  </i>
                ))
              ) : (
                <small>暂无城市</small>
              )}
            </div>
            <div className="asset-transports" aria-label="交通资产">
              {assets.transports.length > 0 ? (
                assets.transports.map((tile) => (
                  <i className={'transport-chip ' + tile.type} key={tile.name} title={tile.name}>
                    {getTransportLabel(tile)}
                  </i>
                ))
              ) : (
                <small>暂无交通</small>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}
function CityDetail({ playerNames, properties, property, provinceStatus, tile }) {
  if (isTransportTile(tile)) {
    const baseText = property ? `${getTransportToll(properties, property.owner)} 元` : '未生效'

    return (
      <div className="city-detail" style={{ '--province-color': '#3b82f6' }}>
        <span>交通资产</span>
        <div className="detail-title">
          <strong>{tile.name}</strong>
          <em>{property ? playerNames[property.owner] : '未购买'}</em>
        </div>
        <p>买价：{getBuyPrice(tile)} 元</p>
        <p>别人停在这里要按你拥有的交通资产数量支付过路费。</p>
        <div className="toll-table">
          <div>
            <span>拥有 1 个</span>
            <strong>250 元</strong>
          </div>
          <div>
            <span>拥有 2 个</span>
            <strong>500 元</strong>
          </div>
          <div>
            <span>拥有 3 个</span>
            <strong>1000 元</strong>
          </div>
        </div>
        <p>当前倍率：{property ? baseText : '未生效'}</p>
      </div>
    )
  }

  if (tile.type !== 'city') {
    return (
      <div className="city-detail">
        <span>当前查看</span>
        <strong>{tile.name}</strong>
        <p>{tile.note}</p>
      </div>
    )
  }

  const ownerHasSet = property
    ? provinceStatus[tile.province].owners[property.owner]?.complete
    : false

  return (
    <div className="city-detail" style={{ '--province-color': getProvinceColor(tile.province) }}>
      <span>城市详情</span>
      <div className="detail-title">
        <strong>{tile.name}</strong>
        <em>{tile.province}</em>
      </div>
      <p>买价：{tile.price} 元</p>
      <p>建房费：{tile.build} 元 / 间</p>
      <p>归属：{property ? playerNames[property.owner] : '未购买'}</p>
      <div className="toll-table">
        {[0, 1, 2, 3].map((houses) => (
          <div key={houses}>
            <span>{houses === 0 ? '空地' : `${houses} 间房`}</span>
            <strong>{getToll(tile, houses, ownerHasSet)} 元</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

function Dice({ disabled, isRolling, onRoll, value }) {
  return (
    <div className={isRolling ? 'dice-card rolling' : 'dice-card'} aria-label={`骰子点数 ${value}`}>
      <span>骰子</span>
      <div className="dice-stage">
        <div className={`dice-cube show-${value}`}>
          {[1, 2, 3, 4, 5, 6].map((side) => (
            <div className={`dice-face face-${side}`} key={side}>
              {Array.from({ length: 9 }).map((_, index) => (
                <i key={index} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <strong>{value} 点</strong>
      <button type="button" onClick={onRoll} disabled={disabled}>掷骰子</button>
    </div>
  )
}

function ChoiceModal({ emptyText, items, moneyLabel, onChoose, onClose, title }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="rules-modal choice-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button type="button" onClick={onClose}>关闭</button>
        </div>
        {items.length === 0 ? (
          <p className="choice-empty">{emptyText}</p>
        ) : (
          <div className="choice-list">
            {items.map((item) => (
              <button type="button" className="choice-card" key={item.name} onClick={() => onChoose(item.name)}>
                <span>{item.meta}</span>
                <strong>{item.name}</strong>
                <small>{item.detail}</small>
                <em>{moneyLabel} {item.price} 元</em>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function TradeModal({ currentPlayerIndex, onClose, onTrade, players, properties }) {
  const tradeTargets = players.filter((player, index) => index !== currentPlayerIndex && !player.bankrupt)
  const [targetIndex, setTargetIndex] = useState(tradeTargets[0]?.id ?? 1)
  const [mode, setMode] = useState('buy')
  const [offer, setOffer] = useState(null)
  const currentPlayer = players[currentPlayerIndex]
  const targetPlayer = players[targetIndex]
  const targetCities = getSellableCities(properties, targetIndex)
  const ownCities = getSellableCities(properties, currentPlayerIndex)
  const availableCities = mode === 'buy' ? targetCities : ownCities
  const [cityName, setCityName] = useState(availableCities[0]?.name || '')
  const payer = mode === 'buy' ? currentPlayer : targetPlayer
  const maxAmount = Math.max(1, payer?.money || 1)
  const [amount, setAmount] = useState(Math.min(800, maxAmount))
  const selectedCityStillValid = availableCities.some((city) => city.name === cityName)
  const finalCityName = selectedCityStillValid ? cityName : availableCities[0]?.name || ''
  const finalAmount = Math.min(Number(amount) || 1, maxAmount)
  const selectedCity = board.find((tile) => tile.name === finalCityName)

  function pickTarget(nextTargetIndex) {
    const nextIndex = Number(nextTargetIndex)
    const nextCities = mode === 'buy' ? getSellableCities(properties, nextIndex) : ownCities
    setTargetIndex(nextIndex)
    setCityName(nextCities[0]?.name || '')
    setAmount(Math.min(800, Math.max(1, players[nextIndex]?.money || 1)))
    setOffer(null)
  }

  function pickMode(nextMode) {
    const nextCities = nextMode === 'buy' ? getSellableCities(properties, targetIndex) : ownCities
    const nextPayer = nextMode === 'buy' ? currentPlayer : targetPlayer
    setMode(nextMode)
    setCityName(nextCities[0]?.name || '')
    setAmount(Math.min(800, Math.max(1, nextPayer?.money || 1)))
    setOffer(null)
  }

  function sendOffer() {
    if (!finalCityName || availableCities.length === 0) return
    setOffer({ amount: finalAmount, cityName: finalCityName, mode, targetIndex })
  }

  if (offer) {
    const offerTarget = players[offer.targetIndex]
    const buyer = offer.mode === 'buy' ? currentPlayer : offerTarget
    const seller = offer.mode === 'buy' ? offerTarget : currentPlayer

    return (
      <div className="modal-backdrop" role="presentation" onClick={onClose}>
        <section className="rules-modal trade-modal compact" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
          <div className="modal-head">
            <h2>等待确认</h2>
            <button type="button" onClick={onClose}>关闭</button>
          </div>
          <div className="trade-confirm">
            <span>{offerTarget.name}</span>
            <strong>同意这笔交易吗？</strong>
            <p>{buyer.name} 支付 {offer.amount} 元，获得 {offer.cityName}</p>
            <small>卖方：{seller.name}</small>
          </div>
          <div className="trade-actions">
            <button type="button" onClick={() => setOffer(null)}>拒绝</button>
            <button type="button" className="accept" onClick={() => onTrade(offer)}>同意交易</button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="rules-modal trade-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <h2>玩家交易</h2>
          <button type="button" onClick={onClose}>关闭</button>
        </div>

        <div className="trade-summary compact-grid">
          <PlayerWallet player={currentPlayer} title="我" cities={ownCities} />
          <PlayerWallet player={targetPlayer} title="对方" cities={targetCities} />
        </div>

        <div className="trade-form simple">
          <label>
            对方
            <select value={targetIndex} onChange={(event) => pickTarget(event.target.value)}>
              {tradeTargets.map((player) => (
                <option key={player.id} value={player.id}>{player.name}</option>
              ))}
            </select>
          </label>

          <div className="trade-mode" role="group" aria-label="交易方式">
            <button className={mode === 'buy' ? 'selected' : ''} type="button" onClick={() => pickMode('buy')}>
              买对方地
            </button>
            <button className={mode === 'sell' ? 'selected' : ''} type="button" onClick={() => pickMode('sell')}>
              卖我的地
            </button>
          </div>

          <label>
            城市
            <select value={finalCityName} onChange={(event) => setCityName(event.target.value)} disabled={availableCities.length === 0}>
              {availableCities.length === 0 ? (
                <option>无城市</option>
              ) : availableCities.map((city) => (
                <option key={city.name} value={city.name}>{city.name}</option>
              ))}
            </select>
          </label>

          <label>
            金额 {finalAmount} 元
            <input type="range" min="1" max={maxAmount} step="50" value={finalAmount} onChange={(event) => setAmount(event.target.value)} />
          </label>
          <input className="money-input" min="1" max={maxAmount} type="number" value={finalAmount} onChange={(event) => setAmount(event.target.value)} />
        </div>

        <div className="trade-preview">
          <span>{mode === 'buy' ? '报价' : '卖出'}</span>
          <strong>{selectedCity?.name || '无城市'}</strong>
          <p>{mode === 'buy' ? currentPlayer.name : targetPlayer?.name} 付 {finalAmount} 元</p>
        </div>

        <button
          className="trade-submit"
          disabled={!finalCityName || availableCities.length === 0}
          onClick={sendOffer}
          type="button"
        >
          发给对方确认
        </button>
      </section>
    </div>
  )
}

function PlayerWallet({ cities, player, title }) {
  if (!player) return null

  return (
    <div className="wallet-card compact">
      <span>{title}</span>
      <strong className={player.color}>{player.name}</strong>
      <p>{player.money} 元</p>
      <small>{cities.length} 个资产</small>
    </div>
  )
}

function RulesModal({ onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="rules-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <h2>怎么玩</h2>
          <button type="button" onClick={onClose}>关闭</button>
        </div>
        <ol>
          <li>2 到 4 名玩家轮流掷骰子，沿着地图外圈前进。</li>
          <li>停在没人买的城市，可以花钱买下；城市价格按现实房价感觉设定，上海最贵。</li>
          <li>对手停在你的城市，要向你支付过路费；停在你的交通资产，要按你拥有的交通数量付费。</li>
          <li>买齐同一颜色地区后，才能在该地区城市建房。</li>
          <li>加油站、高铁站和飞机场也可以买；拥有 1 个收 250 元，2 个收 500 元，3 个收 1000 元。</li>
          <li>本回合中可以和其他玩家交易资产，用钱买对方资产，或把自己的资产卖给对方。</li>
          <li>卖房还钱可以随时使用，会卖掉一个自己的资产，回收金额低于买入价。</li>
          <li>资金变成负数时必须卖房还钱；没有城市可卖还负债，就破产出局。最后留下的玩家获胜。</li>
        </ol>
      </section>
    </div>
  )
}

function Stat({ active = false, label, value }) {
  return (
    <div className={active ? 'stat active' : 'stat'}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function createPlayers(count) {
  return playerPresets.slice(0, count).map((player, index) => ({
    ...player,
    id: index,
    bankrupt: false,
    jailFreeCards: 0,
    money: startMoney,
    position: 0,
  }))
}

function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function addMoneyDelta(changes, playerIndex, amount) {
  return changes.map((value, index) => (index === playerIndex ? value + amount : value))
}


function getPlayerAssets(properties, playerIndex) {
  const ownedTiles = board.filter((tile) => properties[tile.name]?.owner === playerIndex)
  const cities = ownedTiles.filter((tile) => tile.type === 'city')
  const transports = ownedTiles.filter((tile) => isTransportTile(tile))
  const houseCount = cities.reduce((total, city) => total + (properties[city.name]?.houses || 0), 0)

  return {
    cities,
    cityCount: cities.length,
    houseCount,
    transports,
  }
}

function getTransportLabel(tile) {
  if (tile.type === 'fuel') return '油'
  if (tile.type === 'station') return '铁'
  if (tile.type === 'airport') return '机'
  return '交'
}
function getTileMoneyChange(tile) {
  if (tile.type === 'bonus') return tile.amount
  if (tile.type === 'tax') return -tile.amount
  return 0
}

function isTransportTile(tile) {
  return transportTypes.includes(tile.type)
}

function isBuyableTile(tile) {
  return tile.type === 'city' || isTransportTile(tile)
}

function getBuyPrice(tile) {
  return tile.price
}

function getOwnedTransportCount(properties, owner) {
  return board.filter((tile) => isTransportTile(tile) && properties[tile.name]?.owner === owner).length
}

function getTransportToll(properties, owner) {
  const ownedCount = getOwnedTransportCount(properties, owner)
  if (ownedCount >= 3) return 1000
  if (ownedCount === 2) return 500
  return 250
}

function getProvinceColor(province) {
  return provinceColors[province] || '#2a9d8f'
}

function getAllProvinceStatus(properties, playerCount) {
  const provinces = board
    .filter((tile) => tile.type === 'city')
    .map((tile) => tile.province)

  return [...new Set(provinces)].reduce((result, province) => {
    const owners = {}
    for (let owner = 0; owner < playerCount; owner += 1) {
      owners[owner] = getProvinceStatus(properties, province, owner)
    }
    const completeOwner = Object.values(owners).find((status) => status.complete)
    result[province] = completeOwner || owners[0]
    result[province].owners = owners
    return result
  }, {})
}

function getProvinceStatus(properties, province, owner) {
  const cities = board.filter(
    (tile) => tile.type === 'city' && tile.province === province,
  )
  const ownedCities = cities.filter((city) => properties[city.name]?.owner === owner)

  return {
    total: cities.length,
    owned: ownedCities.length,
    complete: cities.length > 0 && ownedCities.length === cities.length,
    owner,
  }
}

function getToll(tile, houses, hasProvinceSet) {
  const rent = tile.rents?.[houses] ?? tile.toll
  if (houses === 0 && hasProvinceSet) return rent * 2
  return rent
}

function getBuildCost(tile) {
  return tile.build
}

function getBuildableCities(properties, playerIndex, money) {
  return board.filter((tile) => {
    const property = properties[tile.name]
    if (tile.type !== 'city' || property?.owner !== playerIndex) return false
    const provinceStatus = getProvinceStatus(properties, tile.province, playerIndex)
    return provinceStatus.complete && property.houses < 3 && money >= getBuildCost(tile)
  })
}

function getSellableCities(properties, playerIndex) {
  return board.filter((tile) => isBuyableTile(tile) && properties[tile.name]?.owner === playerIndex)
}

function getSaleValue(city) {
  return Math.max(100, city.price - getSalePenalty(city))
}

function getSalePenalty(city) {
  if (isTransportTile(city)) return 300
  return city.price >= 1500 ? 600 : 500
}

function checkBankruptcy(players, properties, playerIndex) {
  return checkBankruptcies(players, properties, [playerIndex])
}

function checkBankruptcies(players, properties, playerIndexes = players.map((player) => player.id)) {
  const nextPlayers = players.map((player) => {
    const shouldCheck = playerIndexes.includes(player.id)
    const hasSellableAsset = getSellableCities(properties, player.id).length > 0
    if (shouldCheck && player.money < 0 && !hasSellableAsset) {
      return { ...player, bankrupt: true }
    }
    return player
  })

  const activePlayers = getActivePlayers(nextPlayers)
  const winner = activePlayers.length === 1 ? activePlayers[0].id : null
  return { players: nextPlayers, winner }
}

function getActivePlayers(players) {
  return players.filter((player) => !player.bankrupt)
}

function getNextActivePlayerIndex(players, currentPlayerIndex) {
  for (let offset = 1; offset <= players.length; offset += 1) {
    const nextIndex = (currentPlayerIndex + offset) % players.length
    if (!players[nextIndex].bankrupt) return nextIndex
  }
  return currentPlayerIndex
}

function getGridPosition(index) {
  if (index <= 8) {
    return { gridColumn: index + 1, gridRow: 1 }
  }

  if (index <= 14) {
    return { gridColumn: 9, gridRow: index - 7 }
  }

  if (index <= 22) {
    return { gridColumn: 23 - index, gridRow: 7 }
  }

  return { gridColumn: 1, gridRow: 29 - index }
}

function getTileDescription(tile, properties) {
  if (tile.type === 'start') return `经过起点会获得 ${passStartBonus} 元。`
  if (tile.type === 'chance') return '抽卡可能获得奖励，也可能遇到支出。'
  if (tile.type === 'tax') return `停在这里要支付 ${tile.amount} 元。`
  if (tile.type === 'bonus') return `停在这里可以获得补贴 ${tile.amount} 元。`
  if (tile.type === 'goJail') return '停在这里会直接去监狱。'
  if (tile.type === 'jail') return '监狱格：可以只是路过，也可能从“去监狱”来到这里。'
  if (tile.type === 'corner') return tile.note
  if (properties[tile.name]) return `${tile.name} 已被购买。`
  if (isTransportTile(tile)) return `${tile.name} 可以购买，别人停下会按交通资产数量付费。`
  return `${tile.name} 可以购买，属于${tile.province}。`
}

export default App
