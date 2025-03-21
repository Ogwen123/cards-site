import React, { Fragment } from 'react'
import { title } from '../../utils/string'
import Alert from '../Alert'
import { getApiUrl } from '../../utils/api'
import { Deck, AlertData } from '../../global/types'
import { Dialog, Transition } from '@headlessui/react'
import config from "../../config.json"

type Chip = {
    cardId: string,
    val: string,
    side: "FRONT" | "BACK",
}

const Match = () => {
    const tabs = [
        {
            value: "flashcards",
            selected: false,
            link: "view"
        },
        {
            value: "test",
            selected: false,
            link: "test"
        },
        {
            value: "match",
            selected: true,
            link: "match"
        }
    ]

    const COMPACT_WIDTH = config.layout.compactWidth

    const [width, setWidth] = React.useState<number>(window.innerWidth)
    const [deck, setDeck] = React.useState<Deck>()
    const [id, setId] = React.useState<string>()
    const [alertData, setAlertData] = React.useState<AlertData>(["", false, "NONE"])

    const [dimensions, setDimensions] = React.useState<[number, number]>([4, 4])
    const [cards, setCards] = React.useState<Chip[]>([])
    const [resultDialog, setResultDialog] = React.useState<boolean>(false)
    const [selectedCard, setSelectedCard] = React.useState<Chip>()
    const [matchedCards, setMatchedCards] = React.useState<string[]>([])
    const [startTime, setStartTime] = React.useState<number>(0)

    const shuffle = (array: any[]) => {
        let currentIndex = array.length, randomIndex;

        while (currentIndex > 0) {

            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    React.useEffect(() => {
        const rawId = location.href.split("/").at(-2)
        if (isNaN(parseInt(rawId!))) {
            setAlertData(["The deck ID is invalid.", true, "ERROR"])
            setTimeout(() => {
                setAlertData(["", false, "NONE"])
            }, config.alertLength)
            return
        }
        setId(rawId!)
    }, [])

    React.useEffect(() => {
        const fetchDeck = async () => {
            const res = await fetch(getApiUrl() + "decks/" + id, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    //"Authorization": "Bearer " + SH.get("user").session.token
                }
            })
            let data = await res.json()
            if (!res.ok) {
                setAlertData([data.error ? data.error : data.field_errors[0].message, true, "ERROR"])
                setTimeout(() => {
                    setAlertData(["", false, "NONE"])
                }, config.alertLength)
                return
            } else {
                data = data as Deck
                setDeck(data)
                setCards([])
                if (data.cards.length >= 2) {
                    let dim: [number, number] = [4, 4]
                    if ((data.cards.length * 2) < 4 * 4 && (data.cards.length * 2) > 4 * 3) {
                        dim = [4, 3]
                    } else if ((data.cards.length * 2) < 4 * 3 && (data.cards.length * 2) > 3 * 2) {
                        dim = [3, 2]
                    } else if ((data.cards.length * 2) < 3 * 2 && (data.cards.length * 2) >= 2 * 2) {
                        dim = [2, 2]
                    }
                    setDimensions(dim)

                    const indexes = [...Array(data.cards.length).keys()] // does the same thing as python range
                    let count = 0
                    while (count < ((dim[0] * dim[1]) / 2)) {
                        const indexIndex = Math.floor(Math.random() * indexes.length)
                        const index = indexes[indexIndex]
                        indexes.splice(indexIndex, 1)

                        setCards(
                            (prevCards) => (
                                [{ cardId: data.cards[index].id, val: data.cards[index].back, side: "BACK" }, ...prevCards]
                            ))
                        setCards(
                            (prevCards) => (
                                [{ cardId: data.cards[index].id, val: data.cards[index].front, side: "FRONT" }, ...prevCards]
                            ))
                        count++
                    }
                    setCards((prevCards) => (shuffle(prevCards)))
                    setStartTime(Date.now())
                }
            }
        }

        if (id) {
            fetchDeck().catch((e) => console.log(e))

        } else {
            return
        }
    }, [id])

    React.useEffect(() => {
        if (matchedCards.length === ((dimensions[0] * dimensions[1]) / 2)) {
            setResultDialog(true)
        }
    }, [matchedCards])

    window.addEventListener("resize", () => {
        if (width > COMPACT_WIDTH && window.innerWidth < COMPACT_WIDTH) {
            setWidth(window.innerWidth)
        } else if (width < COMPACT_WIDTH && window.innerWidth > COMPACT_WIDTH) {
            setWidth(window.innerWidth)
        }
    })

    const handleCardClick = (card: Chip) => {
        if (!selectedCard) { setSelectedCard(card) }
        else {
            if (selectedCard.cardId === card.cardId) {
                setMatchedCards((prevCards) => ([...prevCards, card.cardId]))
                setSelectedCard(undefined)
            } else {
                const selCard = selectedCard

                document.getElementById(card.cardId + "-" + card.side)?.classList.add("animate-shake")
                setTimeout(() => {
                    document.getElementById(card.cardId + "-" + card.side)?.classList.remove("animate-shake")
                }, 500)

                document.getElementById(selCard.cardId + "-" + selCard.side)?.classList.add("animate-shake")
                setTimeout(() => {
                    document.getElementById(selCard.cardId + "-" + selCard.side)?.classList.remove("animate-shake")
                }, 500)
                setSelectedCard(undefined)
            }
        }
    }

    return (
        <div className='flex items-center flex-col py-[10px]'>
            <Alert message={alertData[0]} show={alertData[1]} severity={alertData[2]} />
            {
                id ?
                    <div className='w-full'>
                        {
                            deck ?
                                <div className='w-full my-[10px] flex items-center flex-col'>
                                    <div className={
                                        width > COMPACT_WIDTH ?
                                            'bg-main rounded-lg flex flex-row p-[3px] w-3/5'
                                            :
                                            'bg-main rounded-lg flex flex-col p-[3px] w-3/5'
                                    }>
                                        {
                                            tabs.map((val, index) => {
                                                let aClassName = 'w-full mx-[3px]'
                                                if (index === 0) aClassName = 'w-full mr-[3px]'
                                                if (index === tabs.length - 1) aClassName = 'w-full ml-[3px]'
                                                return (

                                                    <a className={aClassName} key={index} href={`/deck/${id}/${val.link}`}>
                                                        <button
                                                            className={
                                                                val.selected ?
                                                                    'bg-bg text-xl rounded-lg w-full outline-none h-[50px] fc'
                                                                    :
                                                                    'text-xl rounded-lg w-full outline-none h-[50px] fc hover:bg-maindark'
                                                            }
                                                        >
                                                            {title(val.value)}
                                                        </button>
                                                    </a>

                                                )
                                            })
                                        }
                                    </div>
                                    <div className='fc flex-col w-3/5 my-[10px]'>
                                        {
                                            cards ?
                                                <div
                                                    className="w-full"
                                                >
                                                    {
                                                        deck.cards.length < 2 ?
                                                            <div className='text-lg'>
                                                                There are not enough cards in this deck to use this mode. A deck must have at least 2 cards in it to use this mode.
                                                            </div>
                                                            :
                                                            <div
                                                                className={"grid gap-4 w-full min-h-[calc(100vh-194px)]"}
                                                                style={{ gridTemplateColumns: `repeat(${dimensions[0].toString()}, minmax(0, 1fr))` }}>
                                                                {
                                                                    cards.map((val, index) => {
                                                                        if (matchedCards.includes(val.cardId)) {
                                                                            return (
                                                                                <div
                                                                                    key={index}
                                                                                    id={val.cardId + "-" + val.side}
                                                                                    className='w-full h-full rounded-lg bg-bg fc text-xl text-bg select-none'>
                                                                                    GOOFY AHH SIZING
                                                                                </div>
                                                                            )
                                                                        } else {
                                                                            return (
                                                                                <div
                                                                                    key={index}
                                                                                    id={val.cardId + "-" + val.side}
                                                                                    className={
                                                                                        selectedCard?.cardId === val.cardId && selectedCard?.side === val.side ?
                                                                                            'w-full h-full rounded-lg bg-main fc text-xl select-none'
                                                                                            :
                                                                                            'w-full h-full rounded-lg bg-bgdark fc text-xl border-solid border-[1px] border-bgdark hover:border-main select-none'
                                                                                    }
                                                                                    onClick={() => { handleCardClick(val) }}
                                                                                >
                                                                                    {val.val}
                                                                                </div>
                                                                            )
                                                                        }
                                                                    })
                                                                }
                                                            </div>
                                                    }
                                                    <Transition appear show={resultDialog} as={Fragment}>
                                                        <Dialog as="div" className="relative z-10" onClose={() => { setResultDialog(false) }}>
                                                            <Transition.Child
                                                                as={Fragment}
                                                                enter="ease-out duration-300"
                                                                enterFrom="opacity-0"
                                                                enterTo="opacity-100"
                                                                leave="ease-in duration-200"
                                                                leaveFrom="opacity-100"
                                                                leaveTo="opacity-0"
                                                            >
                                                                <div className="fixed inset-0 bg-black/25" />
                                                            </Transition.Child>

                                                            <div className="fixed inset-0 overflow-y-auto">
                                                                <div className="flex min-h-full items-center justify-center p-4 text-center">
                                                                    <Transition.Child
                                                                        as={Fragment}
                                                                        enter="ease-out duration-300"
                                                                        enterFrom="opacity-0 scale-95"
                                                                        enterTo="opacity-100 scale-100"
                                                                        leave="ease-in duration-200"
                                                                        leaveFrom="opacity-100 scale-100"
                                                                        leaveTo="opacity-0 scale-95"
                                                                    >
                                                                        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-bgdark p-6 text-left align-middle shadow-xl transition-all">
                                                                            <Dialog.Title
                                                                                className="text-lg"
                                                                            >
                                                                                Results
                                                                            </Dialog.Title>
                                                                            <div className="mt-2">
                                                                                <p className="text-sm">
                                                                                    You took {Math.round((Date.now() - startTime) / 100 * 10) / 100} seconds to match all of the cards. Thats {(Math.round((Date.now() - startTime) / 100 * 10 / ((dimensions[0] * dimensions[1]) / 2)) / 100)} seconds per match.
                                                                                </p>
                                                                            </div>

                                                                            <div className="mt-4 flex flex-row">
                                                                                <button
                                                                                    className="button bg-warning hover:bg-warningdark mr-[5px] outline-none"
                                                                                    onClick={() => { location.href = `/deck/${id}/view` }}
                                                                                >
                                                                                    Leave
                                                                                </button>
                                                                                <button
                                                                                    className="button ml-[5px] outline-none"
                                                                                    onClick={() => { location.reload() }}
                                                                                >
                                                                                    Go Again
                                                                                </button>

                                                                            </div>
                                                                        </Dialog.Panel>
                                                                    </Transition.Child>
                                                                </div>
                                                            </div>
                                                        </Dialog>
                                                    </Transition>
                                                </div>
                                                :
                                                <div>
                                                    <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-bg" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                                    </svg>
                                                </div>
                                        }
                                    </div>
                                </div>
                                :
                                <div className='fc'>
                                    <svg aria-hidden="true" className="w-[100px] h-[100px] text-gray-200 animate-spin dark:text-gray-600 fill-bg" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                    </svg>
                                </div>

                        }
                    </div>
                    :
                    <div><a href="/"><button className='button'>Return to homepage</button></a></div>
            }
        </div>
    )
}

export default Match