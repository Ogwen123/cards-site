import React, { Fragment } from 'react'
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    ArrowPathIcon,
    PencilSquareIcon,
    ShareIcon,
    FolderPlusIcon,
    PencilIcon,
    BookmarkIcon,
    XCircleIcon
} from '@heroicons/react/20/solid'
import Alert, { alertReset } from '../Alert'
import { title } from '../../utils/string'
import { Card, Deck, AlertData } from '../../global/types'
import { getApiUrl } from '../../utils/api'
import { isLoggedIn } from '../../utils/account'
import { Dialog, Transition } from '@headlessui/react'
import { SH } from '../../utils/storageHandler'
import Username from '../Username'
import config from "../../config.json"

type Note = {
    id: string,
    content: string,
    changed: boolean,
    card: Card
}

const View = () => {
    const tabs = [
        {
            value: "flashcards",
            selected: true,
            link: "view"
        },
        {
            value: "test",
            selected: false,
            link: "test"
        },
        {
            value: "match",
            selected: false,
            link: "match"
        }
    ]

    const COMPACT_WIDTH = config.layout.compactWidth

    const [width, setWidth] = React.useState<number>(window.innerWidth)
    const [deck, setDeck] = React.useState<Deck>()
    const [id, setId] = React.useState<string>()
    const [alert, setAlert] = React.useState<AlertData>(alertReset)
    const [currentCard, setCurrentCard] = React.useState<number>(0)
    const [side, setSide] = React.useState<"front" | "back">("front")
    const [shareDialog, setShareDialog] = React.useState<boolean>(false)

    const [loadingScoreChange, setLoadingScoreChange] = React.useState<boolean>(false)
    const [voting, setVoting] = React.useState<"NONE" | "DOWNVOTE" | "UPVOTE">("NONE")
    const [currentNote, setCurrentNote] = React.useState<Note>()

    window.addEventListener("resize", () => {
        if (width > COMPACT_WIDTH && window.innerWidth < COMPACT_WIDTH) {
            setWidth(window.innerWidth)
        } else if (width < COMPACT_WIDTH && window.innerWidth > COMPACT_WIDTH) {
            setWidth(window.innerWidth)
        }
    })

    React.useEffect(() => {
        const rawId = location.href.split("/").at(-2)
        if (isNaN(parseInt(rawId!))) {
            setAlert(["The deck ID is invalid.", "ERROR", true])
            setTimeout(() => {
                setAlert(alertReset)
            }, config.alertLength)
            return
        }
        setId(rawId)
    }, [])


    React.useEffect(() => {
        const fetchDeck = async () => {

            let headers: { "Content-Type": string, "Authorization"?: string } = {
                "Content-Type": "application/json",
            }

            if (SH.get("user")) {
                headers["Authorization"] = "Bearer " + SH.get("user").session.token
            }

            const res = await fetch(getApiUrl("cards") + "decks/" + id, {
                method: "GET",
                headers
            })
            const data = await res.json()
            if (!res.ok) {
                setAlert([data.error ? data.error : data.field_errors[0].message, "ERROR", true])
                setTimeout(() => {
                    setAlert(alertReset)
                }, config.alertLength)
                return
            } else {
                setDeck(data)
            }
        }

        if (id) {
            fetchDeck().catch((e) => console.error(e))
        } else {
            return
        }
    }, [id])



    const changeCard = (dir: "FORWARDS" | "BACKWARDS") => {
        if (dir === "FORWARDS") {
            setCurrentCard((currentCard + 1) % deck?.cards.length!)
        } else {
            const next = currentCard - 1
            if (next < 0) {
                setCurrentCard(deck?.cards.length! + next)
            } else {
                setCurrentCard(next)
            }
        }
        setSide("front")
    }

    const upvote = async () => {
        setLoadingScoreChange(true)
        const res = await fetch(getApiUrl("cards") + "decks/" + id + "/upvote", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + SH.get("user").session.token
            }
        })
        const data = await res.json()
        if (!res.ok) {
            setAlert([data.error ? data.error : data.field_errors[0].message, "ERROR", true])
            setTimeout(() => {
                setAlert(alertReset)
            }, config.alertLength)
            setLoadingScoreChange(false)
            return
        } else {
            if (data.data.score > deck?.score!) {
                setVoting("UPVOTE")
            } else if (data.data.score < deck?.score!) {
                setVoting("NONE")
            }
            setLoadingScoreChange(false)
            setDeck((prevDeck) => ({ ...prevDeck!, score: data.data.score }))
        }
    }

    const downvote = async () => {
        setLoadingScoreChange(true)
        const res = await fetch(getApiUrl("cards") + "decks/" + id + "/downvote", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + SH.get("user").session.token
            }
        })
        const data = await res.json()
        if (!res.ok) {
            setAlert([data.error ? data.error : data.field_errors[0].message, "ERROR", true])
            setTimeout(() => {
                setAlert(alertReset)
            }, config.alertLength)
            setLoadingScoreChange(false)
            return
        } else {
            if (data.data.score < deck?.score!) {
                setVoting("DOWNVOTE")
            } else if (data.data.score > deck?.score!) {
                setVoting("NONE")
            }
            setLoadingScoreChange(false)
            setDeck((prevDeck) => ({ ...prevDeck!, score: data.data.score }))
        }
    }

    const flipCard = () => {
        setSide((side === "front" ? "back" : "front"))
    }

    const updateCachedCards = (card: Card, note: string) => {
        if (!deck) return
        let newArr: Card[] = []
        for (let i of deck.cards) {
            if (i.id === card.id) {
                const newCard: Card = {
                    ...card,
                    note: note
                }
                newArr.push(newCard)
            } else {
                newArr.push(i)
            }
        }
        setDeck((prevDeck) => ({ ...prevDeck!, cards: newArr }))
    }

    const updateNote = async (note: Note) => {
        if (!SH.get("user")) return

        const body: { front: string, back: string, note?: string } = {
            front: note.card.front,
            back: note.card.back
        }

        if (note.changed === true) {
            body.note = note.content
        }

        const res = await fetch(getApiUrl("cards") + "cards/" + note.id, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + SH.get("user").session.token
            },
            body: JSON.stringify(body)
        })

        const data = await res.json()
        if (!res.ok) {
            setAlert([data.error ? data.error : data.field_errors[0].message, "ERROR", true])
            setTimeout(() => {
                setAlert(alertReset)
            }, config.alertLength)
            setLoadingScoreChange(false)
            return
        } else {
            updateCachedCards(note.card, note.content)
        }
    }



    return (
        <div className='flex items-center flex-col py-[10px]'>
            <Alert
                content={alert[0] instanceof Array ? alert[0][1] : alert[0]}
                severity={alert[1]}
                show={alert[2]}
                title={alert[0] instanceof Array ? alert[0][0] : undefined}
                width="80%"
            />
            {
                id ?
                    <div className='w-full'>
                        {
                            deck ?
                                <div className='w-full my-[10px] flex items-center flex-col'>
                                    <div className={ /* the tab bar */
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

                                    <div className='fc flex-col w-3/5'>

                                        <div className='w-full rounded-lg bg-bgdark mt-[20px] p-[10px] flex flex-row items-center'> {/* the card carousel */}
                                            <div className='text-xl mr-[10px]'>
                                                {deck.name}
                                            </div>
                                            <div className='text-textlight flex flex-row'>
                                                by <a href={"/user/" + deck.user.id} className='underline ml-[5px]'>
                                                    <Username mode="CAMO" perms={deck.user.perms} username={deck.user.username} iconSize={4} />
                                                </a>
                                            </div>
                                        </div>
                                        <div className='w-full flex justify-center flex-col my-[10px] bg-bgdark rounded-lg'>
                                            <div className='w-full min-w-[200px] rounded-lg bg-bgdark h-full min-h-[500px] p-[10px] fc flex-col'>
                                                <div>{currentCard + 1}/{deck.cards.length}</div>
                                                <div className='flex justify-center text-3xl my-auto'>
                                                    {
                                                        side === "front" ?
                                                            <div className="text-center">{deck.cards[currentCard].front}</div>
                                                            :
                                                            <div className="text-center">{deck.cards[currentCard].back}</div>
                                                    }
                                                </div>
                                            </div>
                                            <div className='mt-[5px] mx-[10px] mb-[0px] bg-hr rounded-lg h-[1px] min-w-[200px]'></div>
                                            <div className='flex flex-row w-full min-w-[200px]'>
                                                <button
                                                    className='bg-bgdark rounded-bl-lg w-1/3 fc h-[55px] hover:bg-hrdark'
                                                    onClick={() => changeCard("BACKWARDS")}
                                                >
                                                    <ChevronLeftIcon className='h-7 w-7 hover:text-main' />
                                                </button>

                                                <button
                                                    className='bg-bgdark w-1/3 fc h-[55px] hover:bg-hrdark'
                                                    onClick={flipCard}
                                                >
                                                    <ArrowPathIcon className='h-7 w-7 hover:text-main' />
                                                </button>

                                                <button
                                                    className='bg-bgdark rounded-br-lg w-1/3 fc h-[55px] hover:bg-hrdark'
                                                    onClick={() => changeCard("FORWARDS")}
                                                >
                                                    <ChevronRightIcon className='h-7 w-7 hover:text-main' />
                                                </button>
                                            </div>
                                        </div>

                                        <div className='bg-bgdark rounded-lg w-full mb-[10px] p-[10px]'> {/* the description section */}
                                            <div className='text-textlight'>Description</div>
                                            <div>
                                                {deck.description}
                                            </div>
                                            <div className='mt-[10px] mb-[5px] bg-hr rounded-lg h-[1px]'></div>
                                            <div className='text-textlight mb-[5px]'>Tags</div>
                                            <div className='flex flex-row flex-wrap'>
                                                {
                                                    deck.tags.map((val, index) => {
                                                        return (
                                                            <div className={`bg-hr rounded-lg p-[5px] mx-[5px] ${index === 0 ? "ml-[0px]" : ""}`} key={index}>
                                                                {val.replaceAll("-", " ")}
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </div>

                                        <div className='w-full rounded-lg bg-bgdark h-[60px] flex items-center p-[10px]'> {/* the icon bar */}

                                            {
                                                isLoggedIn() &&
                                                <div className='flex flex-row items-center'>


                                                    <div className='flex flex-row mr-[10px]'>
                                                        <button
                                                            className='flex items-center flex-row bg-bg px-[5px] rounded-l-lg h-[40px] min-w-[40px]'
                                                            onClick={() => {
                                                                upvote().catch((err) => console.log(err))
                                                            }}
                                                        >
                                                            <ChevronUpIcon className={
                                                                voting === "UPVOTE" ?
                                                                    "h-6 w-6 m-[5px] text-success"
                                                                    :
                                                                    "h-6 w-6 m-[5px] hover:text-success hover:opacity-50"
                                                            } />

                                                        </button>
                                                        <div className='bg-bg fc h-[40px] w-[40px] border-r-hrdark border-l-hrdark border-r-[1px] border-l-[1px]'>
                                                            {
                                                                loadingScoreChange ?
                                                                    <svg aria-hidden="true" className="w-[15px] h-[15px] text-gray-200 animate-spin dark:text-gray-600 fill-bg" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                                                    </svg>
                                                                    :
                                                                    <div>{deck.score}</div>
                                                            }
                                                        </div>
                                                        <button
                                                            className='flex items-center flex-row bg-bg px-[5px] rounded-r-lg h-[40px] min-w-[40px]'
                                                            onClick={() => {
                                                                downvote().catch((err) => console.log(err))
                                                            }}
                                                        >
                                                            <ChevronDownIcon className={
                                                                voting === "DOWNVOTE" ?
                                                                    "h-6 w-6 m-[5px] text-error"
                                                                    :
                                                                    "h-6 w-6 m-[5px] hover:text-error hover:opacity-50"
                                                            } />
                                                        </button>
                                                    </div>


                                                    <button
                                                        className='flex items-center flex-row bg-bg px-[5px] rounded-lg h-[40px] min-w-[40px]'
                                                        onClick={() => {

                                                        }}
                                                    >
                                                        <FolderPlusIcon className={
                                                            false ?
                                                                "h-5 w-5 m-[5px] text-main"
                                                                :
                                                                "h-5 w-5 m-[5px] hover:text-main hover:opacity-50"
                                                        } />
                                                    </button>
                                                    <div className='bg-hr w-[1px] h-9 mx-[10px]'></div>
                                                </div>
                                            }

                                            <button
                                                className='flex items-center flex-row bg-bg px-[5px] rounded-lg h-[40px] min-w-[40px] fc'
                                                onClick={() => {
                                                    navigator.clipboard.writeText(window.location.href)
                                                    setShareDialog(true)
                                                }}
                                            >
                                                <ShareIcon className="h-5 w-5 hover:text-main hover:opacity-50" />
                                            </button>


                                            {
                                                SH.get("user") && deck.user?.id === SH.get("user").id &&
                                                <div className='flex flex-row items-center'>
                                                    <div className='bg-hr w-[1px] h-9 mx-[10px]'></div>

                                                    <a href={`/deck/${id}/edit`}>
                                                        <button
                                                            className='flex items-center flex-row bg-bg px-[5px] rounded-lg mr-[10px] h-[40px] min-w-[40px] fc'
                                                        >
                                                            <PencilSquareIcon className="h-5 w-5 hover:text-main hover:opacity-50" />
                                                        </button>
                                                    </a>
                                                </div>


                                            }
                                            <Transition appear show={shareDialog} as={Fragment}>
                                                <Dialog as="div" className="relative z-10" onClose={() => { setShareDialog(false) }}>
                                                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
                                                    >
                                                        <div className="fixed inset-0 bg-black/25" />
                                                    </Transition.Child>

                                                    <div className="fixed inset-0 overflow-y-auto">
                                                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                                                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                                                            >
                                                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-bgdark p-6 text-left align-middle shadow-xl transition-all">
                                                                    <Dialog.Title
                                                                        className="text-lg"
                                                                    >
                                                                        Link Copied!
                                                                    </Dialog.Title>
                                                                    <div className="mt-2">
                                                                        <p className="text-sm">
                                                                            The link to share this deck has been copied to your clipboard.
                                                                        </p>
                                                                    </div>

                                                                    <div className="mt-4">
                                                                        <button
                                                                            className="button"
                                                                            onClick={() => { setShareDialog(false) }}
                                                                        >
                                                                            Got it, thanks!
                                                                        </button>
                                                                    </div>
                                                                </Dialog.Panel>
                                                            </Transition.Child>
                                                        </div>
                                                    </div>
                                                </Dialog>
                                            </Transition>


                                        </div>

                                        <div className='flex flex-col w-full my-[10px]'>
                                            <div className='text-xl self-start'>Cards</div>
                                            <div className='self-center w-full'>
                                                {
                                                    deck.cards.map((card, index) => {
                                                        return (
                                                            <div key={index}>
                                                                <div className='bg-bgdark p-[10px] rounded-lg my-[10px]'>
                                                                    <div className='flex flex-row items-center'>
                                                                        <div className='w-1/2'>Card {index + 1}<div className='text-xs opacity-50'>ID: {card.id}</div></div>
                                                                        {
                                                                            SH.get("user") &&
                                                                            <div className='w-1/2 flex justify-end'>
                                                                                {
                                                                                    currentNote && currentNote.id === card.id ?
                                                                                        <div>
                                                                                            <button
                                                                                                onClick={() => {
                                                                                                    setCurrentNote(undefined)
                                                                                                }}
                                                                                            >
                                                                                                <XCircleIcon className='h-4 w-4 mr-[10px] hover:text-error text-textlight' />
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() => {
                                                                                                    updateNote(currentNote).catch((err) => console.log(err))
                                                                                                    setCurrentNote(undefined)
                                                                                                }}
                                                                                            >
                                                                                                <BookmarkIcon className='h-4 w-4 hover:text-main text-textlight' />
                                                                                            </button>
                                                                                        </div>
                                                                                        :
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                setCurrentNote({
                                                                                                    id: card.id,
                                                                                                    content: card.note ? card.note : "",
                                                                                                    changed: false,
                                                                                                    card: card
                                                                                                })
                                                                                            }}
                                                                                        >
                                                                                            <PencilIcon
                                                                                                className='h-4 w-4 hover:text-main text-textlight'
                                                                                                title="Edit this cards note"
                                                                                            />
                                                                                        </button>
                                                                                }
                                                                            </div>
                                                                        }
                                                                    </div>
                                                                    <div className='my-[5px] bg-hr rounded-lg h-[1px]'></div>
                                                                    <div className='fc flex-row min-h-[40px]'>
                                                                        <div className='w-full fc'>{card.front}</div>
                                                                        <div className='bg-hr w-[2px] h-[30px] mx-2'></div>
                                                                        <div className='w-full fc'>{card.back}</div>
                                                                    </div>


                                                                    {card.note &&
                                                                        <div>
                                                                            <div className='my-[5px] bg-hr rounded-lg h-[1px]'></div>
                                                                            <div className='text-textlight'>Note</div>
                                                                            <div className='text-sm'>
                                                                                {card.note}
                                                                            </div>
                                                                        </div>
                                                                    }
                                                                </div>
                                                                {
                                                                    currentNote && currentNote.id === card.id &&
                                                                    <div>

                                                                        <textarea
                                                                            placeholder={'Note for card ' + (index + 1)}
                                                                            className='bg-bgdark rounded-lg w-full p-[5px] outline-none border-solid border-[2px] border-main resize-none h-[120px]'
                                                                            onChange={(e) => {
                                                                                const note = currentNote
                                                                                note.changed = true
                                                                                note.content = e.target.value
                                                                                setCurrentNote(note)
                                                                            }}
                                                                            defaultValue={card.note ? card.note : ""}
                                                                        />
                                                                    </div>
                                                                }
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </div>
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

export default View
