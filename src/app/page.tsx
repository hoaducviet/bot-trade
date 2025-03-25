'use client'
import { Button, Table } from "@radix-ui/themes";
import { ChangeEvent, useEffect, useState } from 'react'

interface Data {
  index: string;
  price: number;
  priceDifference: number;
  percentDifference: number;
  orderAmount: number;
  averagePrice: number;
  priceTP: number;
  foDifference: number;
  soDifference: number;
}

const priceDefault = 1
const defaultNumberOrder = 10

export default function Home() {
  const [type, setType] = useState<string>('Long')
  const [numberOrder, setNumberOrder] = useState<number>(defaultNumberOrder)
  const [data, setData] = useState<Data[] | undefined>(undefined)
  const [price] = useState<number>(priceDefault)
  const [takeProfit, setTakeProfit] = useState<number>(0.45)
  const [stepPrice, setStepPrice] = useState<number>(1)
  const [margin, setMargin] = useState<number>(5)
  const [priceMultiplier, setPriceMultiplier] = useState<number>(1)
  const [moneyMultiplier, setMoneyMultiplier] = useState<number>(1)
  const [moneyFO, setMoneyFO] = useState<number>(1)
  const [moneySO, setMoneySO] = useState<number>(1)
  const [totalMoney, setTotalMoney] = useState<string>()
  const [liquidPrice, setLiquidPrice] = useState<string>()
  const [liquidPercent, setLiquidPercent] = useState<number>()

  const hanleClickType = (typeOrder: string) => {
    setType(typeOrder)
    console.log(typeOrder)
  }

  useEffect(() => {
    let totalPrice = price * moneyFO
    let totalAmount = moneyFO
    const newData = [
      {
        index: "First Order",
        price: price,
        priceDifference: 0,
        percentDifference: 0,
        orderAmount: moneyFO,
        averagePrice: price,
        priceTP: parseFloat((price * (1 + takeProfit / 100)).toFixed(4)),
        foDifference: takeProfit,
        soDifference: 0,
      }
    ]
    for (let index = 0; index < numberOrder; index++) {
      const newPrice = parseFloat((price * (1 - (index + 1) * priceMultiplier * stepPrice / 100)).toFixed(4))
      const priceDifference = parseFloat((price - newPrice).toFixed(4));
      const percentDifference = parseFloat(((price - newPrice) / price * 100).toFixed(4));
      const orderAmount = parseFloat((moneySO * (moneyMultiplier ** index)).toFixed(4));
      totalPrice += newPrice * orderAmount
      totalAmount += orderAmount
      const averagePrice = parseFloat((totalPrice / totalAmount).toFixed(4));
      const priceTP = parseFloat((averagePrice * (1 + takeProfit / 100)).toFixed(4))
      const foDifference = parseFloat(((price - priceTP) / price * 100).toFixed(3))
      const soDifference = parseFloat(((priceTP - newPrice) / newPrice * 100).toFixed(3))
      newData.push({
        index: `#SO${index + 1}`,
        price: newPrice,
        priceDifference: priceDifference,
        percentDifference: percentDifference,
        orderAmount: orderAmount,
        averagePrice: averagePrice,
        priceTP: priceTP,
        foDifference: foDifference,
        soDifference: soDifference,
      })

    }

    setData(newData)
    console.log(newData)
  }, [numberOrder, price, stepPrice, takeProfit, priceMultiplier, moneyFO, moneySO, moneyMultiplier])


  useEffect(() => {
    if (data) {
      let totalAmount = 0
      data.map(item => {
        totalAmount += item.orderAmount
      })

      setTotalMoney(totalAmount.toFixed(3))
    }
  }, [data])


  useEffect(() => {
    if (data) {
      const average = data[data.length - 1].averagePrice
      const liquidPrice = average * (1 - margin / 100);
      setLiquidPrice(liquidPrice.toFixed(3))
      setLiquidPercent(100 / margin)
    }
  }, [data, margin])



  return (
    <div className="flex flex-col">
      <div className="flex flex-row pt-[2vw] px-[4vw] gap-[1.5vw] justify-center font-bold">
        <Button variant="solid" size="2" radius="full" color={`${type === 'Long' ? "green" : "red"}`}>{type}</Button>
        <p className="w-[5vw]">Price: {price}$</p>
        <p className="w-[9vw]">Step Price: {stepPrice || 0}%</p>
        <p className="w-[4vw]">TP: {takeProfit || 0}%</p>
        <p className="w-[6vw]">Margin: x{margin || 0}</p>
        <p className="w-[6vw]">MoneyFO: x{moneyFO || 0}</p>
        <p className="w-[6vw]">MoneySO: x{moneySO || 0}</p>
        <p className="w-[8vw]">Number #SO: {numberOrder || 0}</p>
        <p className="w-[10vw]">Multiplier Money: x{moneyMultiplier || 0}</p>
        <p className="w-[10vw]">Multiplier Price: x{priceMultiplier || 0}</p>
      </div>
      <div className="select-none flex flex-row w-full h-full py-[1vw]">
        <div className="flex flex-col w-[75%] justify-start items-center p-[1vw] max-h-[30vw]">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Lệnh</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Giá đặt lệnh</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Chênh lệch giá</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Số tiền đặt lệnh</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Chi phí trung bình</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Giá chốt lời</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>% Chốt lời lệch với #FO</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>% Chốt lời lệch với #SO</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {data && data?.length > 0 && data?.map(item => {
                return (
                  <Table.Row key={item.index}>
                    <Table.RowHeaderCell>{item.index}</Table.RowHeaderCell>
                    <Table.Cell>{item.price}$</Table.Cell>
                    <Table.Cell>{item.priceDifference}$ / {item.percentDifference}%</Table.Cell>
                    <Table.Cell>{item.orderAmount}$</Table.Cell>
                    <Table.Cell>{item.averagePrice}$</Table.Cell>
                    <Table.Cell>{item.priceTP}$</Table.Cell>
                    <Table.Cell>{item.foDifference}%</Table.Cell>
                    <Table.Cell>{item.soDifference}%</Table.Cell>
                  </Table.Row>
                )
              })}

            </Table.Body>
          </Table.Root>
        </div>
        <div className="flex flex-col w-[25%] justify-start items-center border-[0.5px] py-[1vw] rounded-2xl shadow-xs">
          <div className="flex flex-col gap-5 w-full px-[2vw]">
            <div className="flex flex-row justify-center font-bold">Setting Bottrading</div>
            <div className="gap-2 flex flex-row justify-left">
              <Button onClick={() => hanleClickType('Long')} variant={`${type === 'Long' ? "solid" : "outline"}`} size="2" radius="full" color="green">Long</Button>
              <Button onClick={() => hanleClickType('Short')} variant={`${type === 'Short' ? "solid" : "outline"}`} size="2" radius="full" color="red">Short</Button>
            </div>
            <div className="flex flex-col w-full gap-[0.5vw]">
              <p>1. Cài đặt kích hoạt</p>
              <div className="flex flex-row w-full justify-between items-center">
                <label>Bước giá (%)</label>
                <input
                  type="number"
                  value={stepPrice}
                  placeholder="Bước giá"
                  className="border-[0.1px] focus:border-blue-500 w-[8vw] p-2 rounded-xl"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setStepPrice(parseFloat(parseFloat(e.target.value).toFixed(2)))}
                />
              </div>
              <div className="flex flex-row w-full justify-between items-center">
                <label>Chốt lời (%)</label>
                <input
                  type="number"
                  value={takeProfit}
                  placeholder="Chốt lời mỗi chu kỳ"
                  className="border-[0.1px]  p-2  w-[8vw] rounded-xl"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setTakeProfit(parseFloat(parseFloat(e.target.value).toFixed(2)))}
                />
              </div>
            </div>
            <div className="flex flex-col w-full gap-[0.5vw]">
              <p>2. Đòn bẩy và ký quỹ</p>
              <div className="flex flex-row items-center gap-5">
                <label htmlFor="margin-select" className="block mb-2">
                  Đòn bẩy:
                </label>
                <select
                  id="margin-select"
                  value={margin}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setMargin(parseInt(e.target.value))}
                  className="p-2 border-[0.1px] rounded"
                >
                  <option value="5">x5</option>
                  <option value="10">x10</option>
                  <option value="20">x20</option>
                  <option value="50">x50</option>
                  <option value="100">x100</option>
                </select>
              </div>
              <div className="flex flex-row w-full justify-between items-center">
                <label>Ký quỹ lệnh ban đầu</label>
                <input
                  type="number"
                  placeholder="Lệnh an toàn tối đa"
                  className="border-[0.1px] p-2 w-[8vw] rounded-xl"
                  value={moneyFO}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setMoneyFO(parseFloat(parseFloat(e.target.value).toFixed(2)))}
                />
              </div>
              <div className="flex flex-row w-full justify-between items-center">
                <label>Ký quỹ lệnh an toàn</label>
                <input
                  type="number"
                  placeholder="Lệnh an toàn tối đa"
                  className="border-[0.1px] p-2 w-[8vw] rounded-xl"
                  value={moneySO}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setMoneySO(parseFloat(parseFloat(e.target.value).toFixed(2)))}
                />

              </div>
              <div className="flex flex-row w-full justify-between items-center">
                <label>Lệnh an toàn tối đa</label>
                <input
                  type="number"
                  placeholder="Lệnh an toàn tối đa"
                  className="border-[0.1px] p-2 w-[8vw] rounded-xl"
                  value={numberOrder}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNumberOrder(parseInt(e.target.value) > 200 ? 200 : parseInt(e.target.value))}
                />
              </div>
              <p>Ký quỹ đã đầu tư: ${totalMoney}</p>
              <p>Giá thanh lý ước tính: ${liquidPrice} / {liquidPercent}%</p>
            </div>
            <div className="flex flex-col w-full gap-[0.5vw]">
              <p>3. Cài đặt nâng cao</p>
              <div className="flex flex-row w-full justify-between items-start">
                <label>Hệ số nhân số tiền (x)</label>
                <input
                  type="number"
                  value={moneyMultiplier}
                  placeholder="Hệ số nhân trên số tiền"
                  className="border-[0.1px]  p-2 w-[8vw] rounded-xl"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setMoneyMultiplier(parseFloat(parseFloat(e.target.value).toFixed(2)))}
                />
              </div>
              <div className="flex flex-row w-full justify-between items-start">
                <label>Hệ số nhân bước giá (x)</label>
                <input
                  type="number"
                  value={priceMultiplier}
                  placeholder="Hệ số bước giá"
                  className="border-[0.1px]  p-2 w-[8vw] rounded-xl"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPriceMultiplier(parseFloat(parseFloat(e.target.value).toFixed(2)))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}
