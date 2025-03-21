import React from 'react'

import Alert from '../Alert'
import { title } from '../../utils/string'
import { SH } from '../../utils/storageHandler'
import config from "../../config.json"
import { UserCircleIcon } from '@heroicons/react/20/solid'
import Username from '../Username'
import { getApiUrl } from '../../utils/api'
import { User } from '../../global/types'
import { deconstruct } from '../../utils/snowflake'
import { AlertData } from '../../global/types'
import AccountTab from './components/AccountTab'
import HistoryTab from './components/HistoryTab'
import DecksTab from './components/DecksTab'
import FoldersTab from './components/FoldersTab'

type Tab = "ACCOUNT" | "HISTORY" | "DECKS" | "FOLDERS"

const Dashboard = () => {
    const tabs: { value: Tab, alias: string }[] = [
        {
            value: "ACCOUNT",
            alias: "Account"
        },
        {
            value: "HISTORY",
            alias: "Deck History"
        },
        {
            value: "DECKS",
            alias: "My Decks"
        },
        {
            value: "FOLDERS",
            alias: "Folders"
        }
    ]

    const COMPACT_WIDTH = config.layout.compactWidth

    const [width, setWidth] = React.useState<number>(window.innerWidth)
    // @ts-ignore
    const [id, setId] = React.useState<string>(SH.get("user").user.id)
    const [alertData, setAlertData] = React.useState<AlertData>(["", false, "NONE"])
    const [selectedTab, setSelectedTab] = React.useState<Tab>("ACCOUNT")
    const [user, setUser] = React.useState<User>()

    window.addEventListener("resize", () => {
        if (width > COMPACT_WIDTH && window.innerWidth < COMPACT_WIDTH) {
            setWidth(window.innerWidth)
        } else if (width < COMPACT_WIDTH && window.innerWidth > COMPACT_WIDTH) {
            setWidth(window.innerWidth)
        }
    })

    React.useEffect(() => {
        const fetchUser = async () => {
            const res = await fetch(getApiUrl() + "users/@me", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + SH.get("user").session.token
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
                setUser(data.data)
            }
        }

        if (id) {
            fetchUser().catch((e) => console.log(e))
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

                        {user ?
                            <div className='w-full my-[10px] flex items-center flex-col'>
                                <div className='w-4/5 mb-[10px] '>
                                    <div className='flex items-center flex-row '>
                                        <UserCircleIcon className='h-[75px] w-[75px] mr-[10px]' />
                                        <Username username={user.username} classname={'text-4xl'} flag={user.flags} iconSize={7} />
                                    </div>
                                    <div className='text-textlight'>Account created on {new Date(Number(deconstruct(user.id).timestamp)).toLocaleDateString()}</div>
                                </div>
                                <div className={
                                    width > COMPACT_WIDTH ?
                                        'flex flex-row w-4/5 border-b-hr border-b-[2px]'
                                        :
                                        'flex flex-col w-4/5'
                                }>
                                    {
                                        tabs.map((val, index) => {
                                            const classname = "outline-none text-lg fc rounded-t-lg mr-[20px]"
                                            return (
                                                <button
                                                    className={
                                                        selectedTab === val.value ?
                                                            'bg-hr p-[5px] ' + classname
                                                            :
                                                            ' hover:bg-bgdark  p-[5px] ' + classname
                                                    }
                                                    onClick={() => {
                                                        setSelectedTab(val.value)
                                                    }}
                                                    key={index}
                                                >
                                                    {title(val.alias)}
                                                </button>
                                            )
                                        })
                                    }
                                </div>
                                <div className='fc flex-col w-4/5'>
                                    {
                                        selectedTab === "ACCOUNT" &&
                                        <div className='w-full overflow-hidden'>
                                            <AccountTab user={user} setAlertData={setAlertData} />
                                        </div>
                                    }
                                    {
                                        selectedTab === "HISTORY" &&
                                        <div className='w-full'>
                                            <HistoryTab user={user} setAlertData={setAlertData} />
                                        </div>
                                    }
                                    {
                                        selectedTab === "DECKS" &&
                                        <div className='w-full'>
                                            <DecksTab user={user} setAlertData={setAlertData} />
                                        </div>
                                    }
                                    {
                                        selectedTab === "FOLDERS" &&
                                        <div className='w-full'>
                                            <FoldersTab user={user} setAlertData={setAlertData} />
                                        </div>
                                    }
                                </div>
                            </div>
                            :
                            <div>
                                <div className='fc'>
                                    <svg aria-hidden="true" className="w-[100px] h-[100px] text-gray-200 animate-spin dark:text-gray-600 fill-bg" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                    </svg>
                                </div>
                            </div>
                        }
                    </div>
                    :
                    <div><a href="/"><button className='button'>Return to homepage</button></a></div>
            }
        </div>
    )
}

export default Dashboard