import { useMemo, useState } from 'react'
import './App.css'

const startMoney = 5000
const jailIndex = 22

const board = [
  { type: 'start', name: '起点', note: '经过奖励 500' },
  { type: 'city', name: '天津', province: '京津冀', price: 650, toll: 70, build: 180 },
  { type: 'chance', name: '机会', note: '抽一张卡' },
  { type: 'city', name: '北京', province: '京津冀', price: 1900, toll: 250, build: 650 },
  { type: 'fuel', name: '加油站', amount: 120, note: '支付油费' },
  { type: 'city', name: '杭州', province: '长三角', price: 1500, toll: 190, build: 520 },
  { type: 'city', name: '上海', province: '长三角', price: 2300, toll: 320, build: 760 },
  { type: 'tax', name: '缴税', amount: 220, note: '支付税费' },
  { type: 'goJail', name: '去监狱', note: '直接前往监狱' },
  { type: 'city', name: '南京', province: '长三角', price: 1300, toll: 160, build: 450 },
  { type: 'chance', name: '命运', note: '随机事件' },
  { type: 'city', name: '长沙', province: '华中', price: 760, toll: 85, build: 240 },
  { type: 'city', name: '武汉', province: '华中', price: 900, toll: 105, build: 300 },
  { type: 'station', name: '高铁站', amount: 180, note: '支付车票' },
  { type: 'corner', name: '免费停车', note: '安全停留' },
  { type: 'city', name: '重庆', province: '西南', price: 950, toll: 115, build: 320 },
  { type: 'city', name: '成都', province: '西南', price: 1100, toll: 135, build: 380 },
  { type: 'bonus', name: '补贴站', amount: 160, note: '获得补贴' },
  { type: 'chance', name: '好运', note: '抽一张卡' },
  { type: 'city', name: '兰州', province: '西北', price: 520, toll: 60, build: 160 },
  { type: 'city', name: '西安', province: '西北', price: 800, toll: 95, build: 260 },
  { type: 'tax', name: '维修费', amount: 260, note: '支付维修费' },
  { type: 'jail', name: '监狱', note: '到访或等待' },
  { type: 'city', name: '广州', province: '珠三角', price: 1600, toll: 210, build: 560 },
  { type: 'city', name: '深圳', province: '珠三角', price: 2100, toll: 290, build: 720 },
  { type: 'chance', name: '机会', note: '抽一张卡' },
  { type: 'city', name: '福州', province: '东南', price: 1000, toll: 120, build: 340 },
  { type: 'city', name: '厦门', province: '东南', price: 1450, toll: 180, build: 500 },
]

const chanceCards = [
  { text: '旅游旺季，获得补贴 300 元', money: 300 },
  { text: '城市建设投资，支付 220 元', money: -220 },
  { text: '夜市爆火，获得 260 元', money: 260 },
  { text: '道路施工绕行，支付 140 元', money: -140 },
  { text: '银行分红，获得 200 元', money: 200 },
]

const playerColors = ['red', 'blue']

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
  const [players, setPlayers] = useState(createPlayers())
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [dice, setDice] = useState(1)
  const [properties, setProperties] = useState({})
  const [hasRolled, setHasRolled] = useState(false)
  const [isMoving, setIsMoving] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(1)
  const [winner, setWinner] = useState(null)
  const [message, setMessage] = useState('红方先走。点击城市可查看过路费表。')
  const [logs, setLogs] = useState(['上海、深圳、北京等现实高房价城市更贵；买齐同色地区后才能建房。'])

  const currentPlayer = players[currentPlayerIndex]
  const currentTile = board[currentPlayer.position]
  const selectedTile = board[selectedIndex]
  const provinceStatus = useMemo(() => getAllProvinceStatus(properties), [properties])
  const propertyList = Object.values(properties)
  const currentOwner = properties[currentTile.name]?.owner
  const ownsCurrentTile = currentOwner === currentPlayerIndex
  const ownsCurrentProvince =
    currentTile.type === 'city' &&
    getProvinceStatus(properties, currentTile.province, currentPlayerIndex).complete
  const isInDebt = currentPlayer.money < 0
  const hasSellableHouse = getSellableHouseName(properties, currentPlayerIndex) !== null
  const canBuy =
    !winner &&
    !isMoving &&
    !isInDebt &&
    currentTile.type === 'city' &&
    currentOwner === undefined &&
    currentPlayer.money >= currentTile.price
  const canBuild =
    !winner &&
    !isMoving &&
    !isInDebt &&
    currentTile.type === 'city' &&
    ownsCurrentTile &&
    ownsCurrentProvince &&
    properties[currentTile.name].houses < 3 &&
    currentPlayer.money >= getBuildCost(currentTile)
  const canEndTurn = hasRolled && !winner && !isInDebt && !isMoving
  const canSellHouse = isInDebt && hasSellableHouse && !winner && !isMoving

  function addLog(text) {
    setLogs((oldLogs) => [text, ...oldLogs].slice(0, 6))
  }

  function resolveMoney(currentPlayers, playerIndex, amount) {
    const nextPlayers = currentPlayers.map((player, index) =>
      index === playerIndex ? { ...player, money: player.money + amount } : player,
    )
    return checkBankruptcy(nextPlayers, properties, playerIndex)
  }

  async function rollDice() {
    if (winner) return
    if (isMoving) return
    if (isInDebt) {
      setMessage(`${currentPlayer.name} 负债中，需要先卖房还钱。`)
      return
    }
    if (hasRolled) {
      setMessage('这一回合已经掷过骰子了，可以买地、建房，然后结束回合。')
      return
    }

    const number = Math.floor(Math.random() * 6) + 1
    const startPosition = currentPlayer.position
    let nextPosition = startPosition
    const passedStart = startPosition + number >= board.length
    let text = `${currentPlayer.name} 掷出 ${number}`
    const moneyChanges = [0, 0]

    setDice(number)
    setHasRolled(true)
    setIsMoving(true)
    setMessage(`${currentPlayer.name} 掷出 ${number}，正在移动...`)

    for (let step = 1; step <= number; step += 1) {
      nextPosition = (startPosition + step) % board.length
      setPlayers((currentPlayers) =>
        currentPlayers.map((player, index) =>
          index === currentPlayerIndex ? { ...player, position: nextPosition } : player,
        ),
      )
      setSelectedIndex(nextPosition)
      await sleep(180)
    }

    let tile = board[nextPosition]
    text += `，来到 ${tile.name}`

    if (passedStart) {
      moneyChanges[currentPlayerIndex] += 500
      text += '，经过起点获得 500 元'
    }

    if (tile.type === 'goJail') {
      nextPosition = jailIndex
      tile = board[nextPosition]
      setPlayers((currentPlayers) =>
        currentPlayers.map((player, index) =>
          index === currentPlayerIndex ? { ...player, position: nextPosition } : player,
        ),
      )
      setSelectedIndex(nextPosition)
      await sleep(220)
      text += '，被送往监狱'
    }

    const tileMoney = getTileMoneyChange(tile)
    if (tileMoney !== 0) {
      moneyChanges[currentPlayerIndex] += tileMoney
      text += tileMoney > 0 ? `，获得 ${tileMoney} 元` : `，支付 ${Math.abs(tileMoney)} 元`
    }

    if (tile.type === 'chance') {
      const card = chanceCards[Math.floor(Math.random() * chanceCards.length)]
      moneyChanges[currentPlayerIndex] += card.money
      text += `，${card.text}`
    }

    const landedProperty = properties[tile.name]
    if (tile.type === 'city' && landedProperty && landedProperty.owner !== currentPlayerIndex) {
      const status = getProvinceStatus(properties, tile.province, landedProperty.owner)
      const toll = getToll(tile, landedProperty.houses, status.complete)
      moneyChanges[currentPlayerIndex] -= toll
      moneyChanges[landedProperty.owner] += toll
      text += `，向${players[landedProperty.owner].name}支付过路费 ${toll} 元`
    }

    let nextPlayers = players.map((player, index) => {
      const movedPlayer =
        index === currentPlayerIndex ? { ...player, position: nextPosition } : player
      return { ...movedPlayer, money: movedPlayer.money + moneyChanges[index] }
    })

    const bankruptcy = checkBankruptcy(nextPlayers, properties, currentPlayerIndex)
    nextPlayers = bankruptcy.players

    setSelectedIndex(nextPosition)
    setPlayers(nextPlayers)
    setWinner(bankruptcy.winner)
    setIsMoving(false)
    if (bankruptcy.winner !== null) {
      text += `。${players[currentPlayerIndex].name} 扣不起钱，${players[bankruptcy.winner].name} 获胜。`
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

    setProperties((currentProperties) => ({
      ...currentProperties,
      [currentTile.name]: {
        owner: currentPlayerIndex,
        houses: 0,
      },
    }))
    setPlayers(resolveMoney(players, currentPlayerIndex, -currentTile.price).players)
    setSelectedIndex(currentPlayer.position)
    const text = `${currentPlayer.name} 买下 ${currentTile.name}，花费 ${currentTile.price} 元。`
    setMessage(text)
    addLog(text)
  }

  function buildHouse() {
    if (!canBuild) {
      if (currentTile.type === 'city' && ownsCurrentTile && !ownsCurrentProvince) {
        setMessage(`要先买齐${currentTile.province}全部城市，才能在这里建房。`)
      }
      return
    }

    const cost = getBuildCost(currentTile)
    setProperties((currentProperties) => ({
      ...currentProperties,
      [currentTile.name]: {
        ...currentProperties[currentTile.name],
        houses: currentProperties[currentTile.name].houses + 1,
      },
    }))
    setPlayers(resolveMoney(players, currentPlayerIndex, -cost).players)
    setSelectedIndex(currentPlayer.position)
    const text = `${currentPlayer.name} 给 ${currentTile.name} 建房，花费 ${cost} 元。`
    setMessage(text)
    addLog(text)
  }

  function sellHouse() {
    if (!canSellHouse) return

    const cityName = getSellableHouseName(properties, currentPlayerIndex)
    const city = board.find((tile) => tile.name === cityName)
    const refund = Math.round(city.build * 0.5)
    const nextProperties = {
      ...properties,
      [cityName]: {
        ...properties[cityName],
        houses: properties[cityName].houses - 1,
      },
    }
    const nextPlayers = players.map((player, index) =>
      index === currentPlayerIndex ? { ...player, money: player.money + refund } : player,
    )
    const bankruptcy = checkBankruptcy(nextPlayers, nextProperties, currentPlayerIndex)
    const text =
      bankruptcy.winner === null
        ? `${currentPlayer.name} 卖掉 ${cityName} 的一间房，收回 ${refund} 元。`
        : `${currentPlayer.name} 卖掉房子后仍然还不起，${players[bankruptcy.winner].name} 获胜。`

    setProperties(nextProperties)
    setPlayers(bankruptcy.players)
    setWinner(bankruptcy.winner)
    setMessage(text)
    addLog(text)
  }

  function endTurn() {
    if (!canEndTurn) return
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length
    setCurrentPlayerIndex(nextPlayerIndex)
    setHasRolled(false)
    setMessage(`轮到 ${players[nextPlayerIndex].name}。`)
  }

  function restartGame() {
    setPlayers(createPlayers())
    setCurrentPlayerIndex(0)
    setDice(1)
    setProperties({})
    setHasRolled(false)
    setIsMoving(false)
    setSelectedIndex(1)
    setWinner(null)
    setMessage('新一局开始，红方先走。')
    setLogs(['上海、深圳、北京等现实高房价城市更贵；买齐同色地区后才能建房。'])
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
          <button type="button" onClick={restartGame} disabled={isMoving}>
            重新开始
          </button>
        </div>
        <div className="stats">
          {players.map((player, index) => (
            <Stat
              active={index === currentPlayerIndex}
              key={player.name}
              label={player.name}
              value={`${player.money} 元`}
            />
          ))}
          <Stat label="房产" value={`${propertyList.length} 座`} />
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
            />
          ))}

          <section className="center-panel">
            <div className="turn-card">
              <span>当前回合</span>
              <strong className={playerColors[currentPlayerIndex]}>{currentPlayer.name}</strong>
              <small>{winner === null ? getTileDescription(currentTile, properties) : `${players[winner].name} 获胜`}</small>
            </div>

            <Dice value={dice} />

            <div className="controls">
              <button type="button" className="primary" onClick={rollDice} disabled={winner !== null || isInDebt || isMoving}>
                掷骰子
              </button>
              <button type="button" onClick={buyCity} disabled={!canBuy}>
                买下城市
              </button>
              <button type="button" onClick={buildHouse} disabled={!canBuild}>
                建房升级
              </button>
              <button type="button" onClick={sellHouse} disabled={!canSellHouse}>
                卖房还钱
              </button>
              <button type="button" onClick={endTurn} disabled={!canEndTurn}>
                结束回合
              </button>
            </div>

            <p className={isInDebt ? 'message debt' : 'message'}>{message}</p>

            <CityDetail
              playerNames={players.map((player) => player.name)}
              property={properties[selectedTile.name]}
              provinceStatus={provinceStatus}
              tile={selectedTile}
            />

            <div className="logs">
              {logs.map((log, index) => (
                <p key={`${log}-${index}`}>{log}</p>
              ))}
            </div>
          </section>
        </section>
      </section>

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </main>
  )
}

function Tile({ index, isSelected, onSelect, property, provinceStatus, tile, players }) {
  const gridPosition = getGridPosition(index)
  const tileStyle =
    tile.type === 'city'
      ? { ...gridPosition, '--province-color': getProvinceColor(tile.province) }
      : gridPosition
  const playerIndexes = players
    .map((player, playerIndex) => (player.position === index ? playerIndex : null))
    .filter((playerIndex) => playerIndex !== null)
  const owner = property ? players[property.owner] : null
  const status = tile.type === 'city' ? provinceStatus[tile.province] : null
  const ownerHasSet = property ? status.owners[property.owner]?.complete : false

  return (
    <button
      className={[
        'tile',
        tile.type,
        property ? 'owned' : '',
        ownerHasSet ? 'complete' : '',
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

      {tile.type === 'city' ? (
        <>
          <small>{tile.province}</small>
          <p>买价 {tile.price}</p>
          {owner && (
            <>
              <div className="houses" aria-label={`${property.houses} 间房`}>
                {Array.from({ length: property.houses }).map((_, houseIndex) => (
                  <i className={playerColors[property.owner]} key={houseIndex} />
                ))}
              </div>
              <div className={`owner-strip ${playerColors[property.owner]}`}>
                {owner.shortName}
              </div>
            </>
          )}
        </>
      ) : (
        <small>{tile.note}</small>
      )}
    </button>
  )
}

function CityDetail({ playerNames, property, provinceStatus, tile }) {
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

function Dice({ value }) {
  return (
    <div className="dice-card" aria-label={`骰子点数 ${value}`}>
      <span>骰子</span>
      <div className={`dice dice-${value}`}>
        {Array.from({ length: 9 }).map((_, index) => (
          <i key={index} />
        ))}
      </div>
      <strong>{value} 点</strong>
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
          <li>红方和蓝方轮流掷骰子，沿着地图外圈前进。</li>
          <li>停在没人买的城市，可以花钱买下；城市价格按现实房价感觉设定，上海最贵。</li>
          <li>对手停在你的城市，要向你支付过路费。</li>
          <li>买齐同一颜色地区后，才能在该地区城市建房。</li>
          <li>点击城市格，可以查看空地、1 间房、2 间房、3 间房的过路费。</li>
          <li>加油站扣油费，补贴站加钱，机会和命运会随机加钱或扣钱。</li>
          <li>资金变成负数时必须卖房还钱；没有房可卖还负债，就输掉游戏。</li>
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

function createPlayers() {
  return [
    { name: '红方', shortName: '红', money: startMoney, position: 0 },
    { name: '蓝方', shortName: '蓝', money: startMoney, position: 0 },
  ]
}

function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function getTileMoneyChange(tile) {
  if (tile.type === 'bonus') return tile.amount
  if (tile.type === 'tax' || tile.type === 'station' || tile.type === 'fuel') {
    return -tile.amount
  }
  return 0
}

function getProvinceColor(province) {
  return provinceColors[province] || '#2a9d8f'
}

function getAllProvinceStatus(properties) {
  const provinces = board
    .filter((tile) => tile.type === 'city')
    .map((tile) => tile.province)

  return [...new Set(provinces)].reduce((result, province) => {
    const owners = {}
    for (let owner = 0; owner < 2; owner += 1) {
      owners[owner] = getProvinceStatus(properties, province, owner)
    }
    result[province] = owners[0].complete ? owners[0] : owners[1].complete ? owners[1] : owners[0]
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
  const houseBonus = houses * tile.build
  const setBonus = hasProvinceSet ? 2 : 1
  return (tile.toll + houseBonus) * setBonus
}

function getBuildCost(tile) {
  return tile.build
}

function getSellableHouseName(properties, playerIndex) {
  const ownedWithHouses = Object.entries(properties)
    .filter(([, property]) => property.owner === playerIndex && property.houses > 0)
    .sort(([, a], [, b]) => b.houses - a.houses)

  return ownedWithHouses[0]?.[0] || null
}

function checkBankruptcy(players, properties, playerIndex) {
  const sellableHouse = getSellableHouseName(properties, playerIndex)
  const winner = players[playerIndex].money < 0 && !sellableHouse ? 1 - playerIndex : null
  return { players, winner }
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
  if (tile.type === 'start') return '经过起点会获得 500 元。'
  if (tile.type === 'chance') return '抽卡可能获得奖励，也可能遇到支出。'
  if (tile.type === 'tax') return `停在这里要支付 ${tile.amount} 元。`
  if (tile.type === 'fuel') return `停在这里要支付油费 ${tile.amount} 元。`
  if (tile.type === 'bonus') return `停在这里可以获得补贴 ${tile.amount} 元。`
  if (tile.type === 'station') return `停在这里要支付车票 ${tile.amount} 元。`
  if (tile.type === 'goJail') return '停在这里会直接去监狱。'
  if (tile.type === 'jail') return '监狱格：可以只是路过，也可能从“去监狱”来到这里。'
  if (tile.type === 'corner') return tile.note
  if (properties[tile.name]) return `${tile.name} 已被购买。`
  return `${tile.name} 可以购买，属于${tile.province}。`
}

export default App
