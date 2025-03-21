import React from 'react'

import config from "../../config.json"
import Alert from '../Alert'
import { Deck } from '../../global/types'
import { getApiUrl } from '../../utils/api'
import { SH } from '../../utils/storageHandler'
import { title } from '../../utils/string'
import { AlertData } from '../../global/types'

const Learn = () => {
    const tabs = [
        {
            value: "flashcards",
            selected: false,
            link: "view"
        },
        {
            value: "learn",
            selected: true,
            link: "learn"
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
    const [alertData, setAlertData] = React.useState<AlertData>(["", false, "NONE"])
    const [deck, setDeck] = React.useState<Deck>()
    const [id, setId] = React.useState<string>()

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
            setAlertData(["The deck ID is invalid.", true, "ERROR"])
            setTimeout(() => {
                setAlertData(["", false, "NONE"])
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

            const res = await fetch(getApiUrl() + "decks/" + id, {
                method: "GET",
                headers
            })
            const data = await res.json()
            if (!res.ok) {
                setAlertData([data.error ? data.error : data.field_errors[0].message, true, "ERROR"])
                setTimeout(() => {
                    setAlertData(["", false, "NONE"])
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

    return (
        <div className='flex items-center flex-col py-[10px]'>
            <Alert message={alertData[0]} show={alertData[1]} severity={alertData[2]} />
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

export default Learn