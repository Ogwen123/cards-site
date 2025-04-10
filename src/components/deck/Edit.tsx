import React from 'react'

import {
    XCircleIcon,
    TrashIcon,
    PlusCircleIcon,
    CheckCircleIcon
} from '@heroicons/react/20/solid'
import { RadioGroup } from '@headlessui/react'

import Alert, { alertReset } from '../Alert'
import { getApiUrl } from '../../utils/api'
import { SH } from '../../utils/storageHandler'
import { Deck, DeckDraft, Visibility } from "../../global/types"
import { CardCreate, AlertData } from '../../global/types'
import config from "../../config.json"
//import DescriptionWriter from '../DescriptionWriter'

const Edit = () => {
    const [alert, setAlert] = React.useState<AlertData>(alertReset)

    const [tags, setTags] = React.useState<string[]>([])
    const [cards, setCards] = React.useState<CardCreate[]>([])
    const [description, setDescription] = React.useState<string>("")
    const [visibility, setVisibilty] = React.useState<Visibility>("PUBLIC")

    const [loading, setLoading] = React.useState<boolean>(false)
    const [id, setId] = React.useState<string>()
    const [originalDeck, setOriginalDeck] = React.useState<DeckDraft>()
    const [deck, setDeck] = React.useState<DeckDraft>()
    const [changesMade, setChangesMade] = React.useState<boolean>(false)

    const asn = () => { // autosave name
        return config.autosave.edit_name + id
    }

    React.useEffect(() => {
        const rawId = location.href.split("/").at(-2)
        setId(rawId)
    }, [])

    React.useEffect(() => {
        const fetchDeck = async () => {
            const res = await fetch(getApiUrl("cards") + "decks/" + id, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + SH.get("user").token
                }
            })
            let data = await res.json()
            if (!res.ok) {
                setAlert([data.error, "ERROR", true])
                setTimeout(() => {
                    setAlert(alertReset)
                }, config.alertLength)
                return
            } else {
                let rawDeckData: Deck = data.data as Deck

                if (SH.get("user").id !== rawDeckData.user.id) {
                    setAlert(["You are not the owner of this deck!", "ERROR", true])
                }

                let deckData: DeckDraft = { ...rawDeckData, tags: rawDeckData.tags.map((tag, _) => tag.name) }

                if (SH.get(asn()) !== null) {
                    console.log("getting from ls")
                    deckData = SH.get(asn()) as DeckDraft
                }

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
                setDescription(deckData.description)
                setOriginalDeck(deckData)
                setDeck(deckData)
                SH.set(asn(), deckData)
            }
        }

        if (id) {
            fetchDeck().catch((e) => console.log(e))
        } else {
            return
        }
    }, [id])

    const tagKeyPressHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== "Enter") return
        e.preventDefault()

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
        console.log("runnign autosave");

        e.preventDefault()
        const tempCards = cards
        if (part === "TERM") {
            tempCards[cardNum] = { front: e.target.value, back: tempCards[cardNum].back }
        } else {
            tempCards[cardNum] = { front: tempCards[cardNum].front, back: e.target.value }
        }
        setCards(tempCards)
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
        if (!deck) return
        setChangesMade(true)
        let metaData: { [key: string]: string } = {}
        const rawData: { name: string, value: string }[] = [
            { name: "name", value: (document.getElementById("name") as HTMLFormElement)?.value },
            { name: "topic", value: (document.getElementById("topic") as HTMLFormElement)?.value },
            { name: "description", value: description }
        ]

        for (let i of rawData) {
            if (i.value == "") setAlert([`Fill in all the fields. ${i.name}`, "ERROR", true])
            metaData[i.name] = i.value
        }

        SH.set(asn(), {
            name: metaData.name,
            topic: metaData.topic,
            description: metaData.description,
            visibility: visibility,
            cards: cards,
            tags: tags

        })
    }

    // useEffect to trigger autosave
    React.useEffect(() => {
        console.log("doing autosave");

        autosave()
    }, [cards, tags, description, visibility])

    const submit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setLoading(true)
        autosave()
        const res = await fetch(getApiUrl("cards") + "decks/" + id, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + SH.get("user").session.token
            },
            body: JSON.stringify(SH.get(asn()))
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
            SH.remove(config.autosave.edit_name + id)
            location.href = `/decks/${id}`
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
            {
                deck ?
                    <div className="fc flex-col form w-3/5">
                        <div className="text-2xl mt-[10px] mb-[15px] flex flex-row">Edit <div className='text-textlight ml-[7px]'>{(originalDeck as DeckDraft).name}</div></div>
                        <div id="info" className="w-full flex flex-col" >{/* form for general info (name, topic, etc) */}
                            <input
                                id="name"
                                type="text"
                                placeholder='Enter a name'
                                className='form-input'
                                defaultValue={(originalDeck as DeckDraft).name}
                                onBlur={autosave}
                            />

                            <input
                                id="topic"
                                type="text"
                                placeholder='Topic/Subject'
                                className='form-input'
                                defaultValue={(originalDeck as DeckDraft).topic}
                                onBlur={autosave}
                            />

                            {/*<DescriptionWriter updateFunc={updateDescription} /> ill finish later™*/}
                            <textarea
                                name="description"
                                placeholder="Description"
                                className="form-input h-[150px] resize-none"
                                onChange={(e) => { setDescription(e.target.value) }}
                                defaultValue={description}
                            />
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
                                    <div
                                        onClick={() => {
                                            removeTag(index)
                                        }}
                                    >
                                        <XCircleIcon className='h-4 w-4 hover:text-error' /></div>
                                </div>
                            ))}
                            <input type="text" placeholder="Add Tags" onKeyDown={tagKeyPressHandler} className=' bg-bgdark outline-none h-[44px] mx-[5px] flex-1 min-w-[100px]' />
                        </div>
                        <div className='w-full'>
                            <div className='text-xl mt-[10px] mb-[15px]'>Add cards to the deck</div>
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
                        <button onClick={submit} className='button flex justify-center w-full'>{loading ?
                            <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-bg" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                            </svg>
                            :
                            "Submit"}</button>

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
    )
}

export default Edit