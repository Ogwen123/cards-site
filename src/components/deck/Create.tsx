import React, { Fragment } from 'react'

import {
    XCircleIcon,
    TrashIcon,
    PlusCircleIcon,
    CheckCircleIcon,
    ArrowDownTrayIcon
} from '@heroicons/react/20/solid'
import { Dialog, RadioGroup, Transition } from '@headlessui/react'

import Alert, { alertReset } from '../Alert'
import { getApiUrl } from '../../utils/api'
import { SH } from '../../utils/storageHandler'
import { DeckDraft, Visibility } from "../../global/types"
import { CardCreate, AlertData } from '../../global/types'
import config from "../../config.json"
//import DescriptionWriter from '../DescriptionWriter'


const Create = () => {

    const [alert, setAlert] = React.useState<AlertData>(alertReset)
    const [metaData, setMetaData] = React.useState<{ name: string, topic: string, description: string }>({ name: "", topic: "", description: "" })
    const [tags, setTags] = React.useState<string[]>([])
    const [cards, setCards] = React.useState<CardCreate[]>([])
    const [visibility, setVisibilty] = React.useState<Visibility>("PUBLIC")
    const [loading, setLoading] = React.useState<boolean>(false)
    const [settingUp, setSettingUp] = React.useState<boolean>(true)
    const [autosavedDeck, setAutosavedDeck] = React.useState<DeckDraft>()
    const [changesMade, setChangesMade] = React.useState<boolean>(false)
    const [openImportDialog, setOpenImportDialog] = React.useState<boolean>(false)
    const [importDialogError, setImportDialogError] = React.useState<[boolean, string]>([false, ""])
    const [importedText, setImportedText] = React.useState<string>()

    React.useEffect(() => {
        let deckData: DeckDraft | null = SH.get("create_deck_autosave")
        if (!deckData) { setSettingUp(false); return }
        deckData = deckData as DeckDraft

        setTags(deckData.tags)
        const cards = []
        for (let i of deckData.cards) {
            cards.push({
                front: i.front,
                back: i.back
            })
        }
        setCards(cards)
        setVisibilty(deckData.visibility)
        setAutosavedDeck(deckData)
        setMetaData({
            name: deckData.name,
            topic: deckData.topic,
            description: deckData.description
        })
        SH.set("create_deck_autosave", deckData)
        setSettingUp(false)
    }, [])

    const tagKeyPressHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== "Enter") return
        e.preventDefault()

        if (tags.length > 19) {
            setAlert(["You cannot have more than 20 tags for a deck.", "ERROR", true])
            setTimeout(() => {
                setAlert(alertReset)
            }, config.alertLength)
            return
        }


        const tagText = e.currentTarget.value.replaceAll(" ", "-")
        if (tagText.trim() === "") return

        setTags([...tags, tagText])
        e.currentTarget.value = ""
    }

    const addCard = () => {
        if (cards.length > 255) {
            setAlert(["You cannot have more than 256 cards in a deck.", "ERROR", true])
            setTimeout(() => {
                setAlert(alertReset)
            }, config.alertLength)
            return
        }
        setCards([...cards, { front: "", back: "" }])
    }

    const editCard = (e: React.ChangeEvent<HTMLInputElement>, part: "TERM" | "DEFINITION", cardNum: number) => {
        e.preventDefault()
        const tempCards = cards
        if (part === "TERM") {
            tempCards[cardNum] = { front: e.target.value, back: tempCards[cardNum].back }
        } else {
            tempCards[cardNum] = { front: tempCards[cardNum].front, back: e.target.value }
        }
        setCards([...tempCards])
    }

    const removeCard = (index: number) => {
        if (cards.length < 2) {
            setAlert(["You must have at least one card in a deck.", "ERROR", true])
            setTimeout(() => {
                setAlert(alertReset)
            }, config.alertLength)
            return
        }
        const newCards = cards.filter((val, i) => {
            val = val
            return i !== index
        })
        setCards(newCards)
    }

    const removeTag = (index: number) => {
        const newTags = tags.filter((val, i) => {
            val = val
            return i !== index
        })
        setTags(newTags)
    }

    const autosave = () => {
        if (settingUp) return

        SH.set("create_deck_autosave", {
            name: metaData.name,
            topic: metaData.topic,
            description: metaData.description,
            visibility: visibility,
            cards: cards,
            tags: tags
        })
        setChangesMade(true)
    }

    // useEffect to trigger autosave, other fields are triggered onBlur
    React.useEffect(() => {
        autosave()
    }, [cards, tags, metaData, visibility])

    window.addEventListener("close", () => {
        autosave()
    })

    const submit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()

        setLoading(true)
        const res = await fetch(getApiUrl("cards") + "decks/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + SH.get("user").token
            },
            body: JSON.stringify(SH.get("create_deck_autosave"))
        })

        const data = await res.json()
        if (!res.ok) {
            setAlert([data.error ? data.error : data.field_errors[0].message, "ERROR", true])

            setLoading(false)

            setTimeout(() => {
                setAlert(alertReset)
            }, config.alertLength)
            return
        } else {
            setAlert(["Successfully created deck.", "SUCCESS", true])
            setLoading(false)
            SH.remove("create_deck_autosave")
            location.href = "/decks"
        }
    }

    const cancel = () => {
        if (!SH.get(config.autosave.create_name)) return
        SH.remove(config.autosave.create_name)
        location.href = "/decks"
    }

    const handleImportSubmit = (): boolean => {
        if (!importedText) {
            setImportDialogError([true, "You have not pasted any text."])
            return false
        }
        const regex = new RegExp("([A-Za-z0-9 ]{1,},[A-Za-z0-9 ]{1,};){1,}")
        if (regex.test(importedText)) {
            console.log("worked")
            const newCards: CardCreate[] = []
            for (let i of importedText.split(";")) {
                const sides = i.split(",")
                if (sides.length === 1) continue
                newCards.push({ front: sides[0], back: sides[1] })
            }
            setCards((prevCards) => ([...prevCards, ...newCards]))

            return true
        } else {
            setImportDialogError([true, "The pasted text has the wrong format. Follow the guide above if you need help."])
            return false
        }
    }

    return (
        <div className="fc flex-col pt-[10px]">
            <Alert
                content={alert[0] instanceof Array ? alert[0][1] : alert[0]}
                severity={alert[1]}
                show={alert[2]}
                title={alert[0] instanceof Array ? alert[0][0] : undefined}
                width="80%"
            />
            <div className="fc flex-col form w-3/5">
                <div className="text-2xl mt-[10px] mb-[10px]">Create a new deck</div>
                {autosavedDeck && <div className="text-textlight mb-[15px]">Previously autosaved deck</div>}
                <div id="info" className="w-full flex flex-col" >{/* form for general info (name, topic, etc) */}
                    <input
                        id="name"
                        type="text"
                        placeholder='Enter a name'
                        className='form-input'
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => { console.log(e); setMetaData((prevData) => ({ name: e.target.value, topic: prevData?.topic, description: prevData?.description })) }}
                        defaultValue={autosavedDeck ? metaData.name : ""}
                    />


                    <input
                        id="topic"
                        type="text"
                        placeholder='Topic/Subject'
                        className='form-input'
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setMetaData((prevData) => ({ name: prevData?.name, topic: e.target.value, description: prevData?.description })) }}
                        defaultValue={autosavedDeck ? metaData?.topic : ""}
                    />

                    {/*<DescriptionWriter updateFunc={updateDescription} /> ill finish later™*/}
                    <textarea name="description" placeholder="Description" className="form-input h-[150px] resize-vertical" onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => { setMetaData((prevData) => ({ name: prevData?.name, topic: prevData?.topic, description: e.target.value })) }} defaultValue={autosavedDeck ? metaData?.description : ""} />
                </div>
                <RadioGroup value={visibility} onChange={setVisibilty} className="flex flex-row w-full my-[5px]">
                    <RadioGroup.Label className="hidden">
                        Visibility
                    </RadioGroup.Label>
                    <RadioGroup.Option value="PUBLIC" className="w-[calc((100%/3)-5px)]">
                        {({ checked }) => (
                            <span
                                className={checked ?
                                    'fc text-xl bg-main h-[58px] w-full mr-[10px] rounded-lg px-[30px]'
                                    :
                                    'fc text-xl bg-bgdark h-[58px] w-full mr-[10px] rounded-lg px-[30px] hover:bg-maindark'}>
                                <div className='w-1/3'></div>{/* spacer */}
                                <div className="w-1/3 fc">Public</div>
                                <div className="w-1/3">{checked && <CheckCircleIcon className='h-6 w-6 ml-[50px]' />}</div>
                            </span>
                        )}
                    </RadioGroup.Option>
                    <RadioGroup.Option value="PRIVATE" className="w-[calc((100%/3)-10px)]">
                        {({ checked }) => (
                            <span
                                className={checked ?
                                    'fc text-xl bg-main h-[58px] w-full mx-[10px] rounded-lg px-[30px]'
                                    :
                                    'fc text-xl bg-bgdark h-[58px] w-full mx-[10px] rounded-lg px-[30px] hover:bg-maindark'}>
                                <div className='w-1/3'></div>{/* spacer */}
                                <div className="w-1/3 fc">Private</div>
                                <div className="w-1/3">{checked && <CheckCircleIcon className='h-6 w-6 ml-[50px]' />}</div>
                            </span>
                        )}
                    </RadioGroup.Option>
                    <RadioGroup.Option value="UNLISTED" className="w-[calc((100%/3)-5px)]">
                        {({ checked }) => (
                            <span
                                className={checked ?
                                    'fc text-xl bg-main h-[58px] w-full ml-[19px] rounded-lg px-[30px] '
                                    :
                                    'fc text-xl bg-bgdark h-[58px] w-full ml-[19px] rounded-lg px-[30px] hover:bg-maindark'}>
                                <div className='w-1/3'></div>{/* spacer */}
                                <div className="w-1/3 fc">Unlisted</div>
                                <div className="w-1/3">{checked && <CheckCircleIcon className='h-6 w-6 ml-[50px]' />}</div>
                            </span>
                        )}
                    </RadioGroup.Option>
                </RadioGroup>
                <div
                    className='form-input w-full min-h-[58px] p-[5px] flex flex-wrap'
                >
                    {tags.map((tag, index) => (
                        <div className="inline-flex flex-row items-center bg-hr rounded-lg py-[3px] px-[6px] m-[5px]" key={index}>
                            <div className="mr-1">{tag.replaceAll("-", " ")}</div>
                            <div onClick={() => removeTag(index)}><XCircleIcon className='h-4 w-4 hover:text-error' /></div>
                        </div>
                    ))}
                    <input type="text" placeholder="Add Tags" onKeyDown={tagKeyPressHandler} className=' bg-bgdark outline-none h-[44px] mx-[5px] flex-1 min-w-[100px]' />
                </div>
                <div className='w-full'>

                    <div className='flex flex-row items-center'>
                        <div className='text-xl my-[10px] mr-[30px]'>Add cards to the deck</div>
                        <div className='my-[10px] text-textlight mr-[10px]'>or import from quizlet</div>
                        <ArrowDownTrayIcon className='h-5 w-5 hover:text-main' onClick={() => setOpenImportDialog(true)} />
                    </div>
                    <Transition appear show={openImportDialog} as={Fragment}>
                        <Dialog as="div" className="relative z-10" onClose={() => { setOpenImportDialog(false) }}>
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
                                                Import!
                                            </Dialog.Title>
                                            <div className="mt-2">
                                                <div className='text-textlight'>
                                                    <a href="/guide/quizlet-export" target="_blank" className='underline text-secondary outline-none h-[20px]'>Click here</a>&nbsp;to get a guide on how to export from quizlet and import it here.
                                                </div>
                                                <textarea
                                                    placeholder='Paste the exported text here.'
                                                    className='bg-bgdark rounded-lg w-full h-[125px] resize-y py-[5px] px-[10px] outline-none broder-solid border-[2px] border-main mt-[10px]'
                                                    onChange={(e) => {
                                                        setImportedText(e.target.value.trim())
                                                    }}
                                                >

                                                </textarea>
                                                {
                                                    importDialogError[0] &&
                                                    <div className='text-error mb-[10px]'>{importDialogError[1]}</div>
                                                }
                                            </div>

                                            <div className="mt-4">
                                                <button
                                                    className="button"
                                                    onClick={() => {
                                                        handleImportSubmit()
                                                        setOpenImportDialog(false)
                                                    }}
                                                >
                                                    Import
                                                </button>
                                                <button
                                                    className="button bg-warning hover:bg-warningdark"
                                                    onClick={() => { setOpenImportDialog(false) }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </Dialog.Panel>
                                    </Transition.Child>
                                </div>
                            </div>
                        </Dialog>
                    </Transition>
                    <div>
                        {
                            cards.map((card, index) => {
                                return (
                                    <div className='bg-bgdark p-[10px] rounded-lg min-h-[124px] my-[10px]' key={index}>
                                        <div className='flex flex-row items-center'>
                                            <div className='mr-auto'>Card {index + 1}</div>
                                            <div onClick={() => removeCard(index)}><TrashIcon className='h-5 w-5 hover:text-error' /></div>
                                        </div>
                                        <div className='my-[5px] bg-hr rounded-lg h-[1px]'></div>
                                        <form className="flex flex-row pr-1">
                                            <div className="w-1/2">
                                                <input
                                                    placeholder='Term'
                                                    onChange={(e) => {
                                                        editCard(e, "TERM", index)
                                                    }}
                                                    className='form-input-small w-full mr-[5px] my-[10px] border-hr'
                                                    defaultValue={changesMade ? card.front : ""}
                                                />
                                            </div>
                                            <div className="w-1/2">
                                                <input
                                                    placeholder='Definition'
                                                    onChange={(e) => {
                                                        editCard(e, "DEFINITION", index)
                                                    }}
                                                    className='form-input-small w-full ml-[5px] my-[10px] border-hr'
                                                    defaultValue={changesMade ? card.back : ""}
                                                />
                                            </div>
                                        </form>
                                    </div>
                                )
                            })
                        }
                        <div>
                            <div onClick={addCard} className='fc flex-row bg-bgdark p-[10px] my-[10px] rounded-lg min-h-[124px] border-solid border-bgdark border-2 hover:border-main text-xl'>
                                <PlusCircleIcon className='h-[75px] w-[75px]' />
                            </div>

                        </div>

                    </div>
                </div>
                <div className='my-[10px] bg-hr rounded-lg h-[2px] w-full'></div>
                <button onClick={submit} className='button flex justify-center w-full'>{loading ?
                    <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-bg" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                    </svg>
                    :
                    "Submit"}
                </button>
                <button onClick={cancel} className='button flex justify-center w-full bg-warning hover:bg-warningdark'>
                    Cancel
                </button>

            </div>
        </div>
    )
}

export default Create
