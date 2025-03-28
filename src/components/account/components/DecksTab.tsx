import React from 'react'
import { Deck, SortOption, SortOptionObj, User } from '../../../global/types'
import { getApiUrl } from '../../../utils/api'
import { SH } from '../../../utils/storageHandler'
import config from "../../../config.json"
import { Menu } from '@headlessui/react'
import { ChevronDownIcon, StarIcon, BarsArrowUpIcon, BarsArrowDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { deconstruct } from '../../../utils/snowflake'
import DeckChip from '../../DeckChip'

interface DecksTabProps {
    user: User,
    setAlertData: any
}

const DecksTab = ({ user, setAlertData }: DecksTabProps) => {

    const [userDecks, setUserDecks] = React.useState<Deck[][]>([[]])
    const [currentDecks, setCurrentDecks] = React.useState<Deck[]>([])
    const [deckPage, setDeckPage] = React.useState<number>(0)
    const [sortOption, setSortOption] = React.useState<SortOptionObj>({ option: "RATING", alias: "Rating" })
    const [gridCols, setGridCols] = React.useState<string>(`repeat(${Math.floor((window.innerWidth * 0.8) / 340)}, minmax(0, 340px))`)
    const [loading, setLoading] = React.useState<boolean>(true)

    window.addEventListener("resize", () => {
        if (`repeat(${Math.floor((window.innerWidth * 0.8) / 340)}, 340px)` !== gridCols) setGridCols(`repeat(${Math.floor((window.innerWidth * 0.8) / 340)}, 340px)`)
    })

    const sortDecks = (by: SortOption, data: Deck[]): Deck[] => {
        if (by === "RATING") {
            let sortedData = data.sort(
                (d1: Deck, d2: Deck) => { // sort by match score, if they have equal match score sort by upvote/downvote score
                    return (d1.score < d2.score)
                        ? 1
                        : (d1.score > d2.score)
                            ? -1
                            : 0
                });
            return sortedData
        } else if (by === "NEWEST") {
            let sortedData = data.sort(
                (d1: Deck, d2: Deck) => { // sort by match score, if they have equal match score sort by upvote/downvote score
                    return (new Date(Number(deconstruct(d1.id).timestamp)).getTime() < new Date(d2.updated_at).getTime())
                        ? 1
                        : (new Date(Number(deconstruct(d1.id).timestamp)).getTime() > new Date(d2.updated_at).getTime())
                            ? -1
                            : 0
                });
            return sortedData
        } else if (by === "OLDEST") {
            let sortedData = data.sort(
                (d1: Deck, d2: Deck) => { // sort by match score, if they have equal match score sort by upvote/downvote score
                    return (new Date(Number(deconstruct(d1.id).timestamp)).getTime() > new Date(d2.updated_at).getTime())
                        ? 1
                        : (new Date(Number(deconstruct(d1.id).timestamp)).getTime() < new Date(d2.updated_at).getTime())
                            ? -1
                            : 0
                });
            return sortedData
        }
        return []
    }

    const fetchDecks = async (page: number) => {
        const res = await fetch(getApiUrl("cards") + "users/@me/decks", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + SH.get("user").token
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
            setUserDecks((prevDecks) => ([...prevDecks, data.data]))
            if (page === 0) {
                setCurrentDecks(sortDecks("RATING", data.data))
            }
            setLoading(false)
        }
    }

    React.useEffect(() => {
        user.id // !remove
        setUserDecks([])
        fetchDecks(0).catch((e) => console.error(e))
        setDeckPage(0)
    }, [])

    React.useEffect(() => {
        if (userDecks && userDecks.length !== 0) {
            if (deckPage === userDecks.length - 1) {
                fetchDecks(userDecks.length).catch((e) => { console.error(e) })
            }
            setCurrentDecks([...sortDecks(sortOption.option, userDecks[deckPage])])
        }
    }, [deckPage])

    React.useEffect(() => {
        // sort the cards in the appropriate order
        if (!currentDecks || currentDecks.length === 0) {
            return
        }
        setCurrentDecks((prevDecks) => ([...sortDecks(sortOption.option, prevDecks)]))
    }, [sortOption])

    const changePage = (dir: "BACKWARDS" | "FORWARDS") => {
        if (!userDecks) return
        if (dir === "FORWARDS") {
            setDeckPage((deckPage + 1) % userDecks.length!)
        } else {
            const next = deckPage - 1
            if (next < 0) {
                setDeckPage(userDecks.length! + next)
            } else {
                setDeckPage(next)
            }
        }
    }

    return (
        <div>
            {
                !loading ?
                    <div>
                        <div className='flex flex-row mt-[10px]'>
                            <Menu as="div" className="fc flex-col text-lg bg-bgdark rounded-lg ml-auto w-[175px] p-[5px]">
                                <Menu.Button className="text-lg fc">
                                    <div className=''>Sort by {sortOption.alias}</div>
                                    <ChevronDownIcon
                                        className="-mr-1 ml-1 h-5 w-5 text-white hover:text-main"
                                        aria-hidden="true"
                                    />
                                </Menu.Button>
                                <Menu.Items className="absolute top-[225px] bg-bgdark rounded-lg p-[10px] m-[10px] z-1">
                                    <div className='flex flex-col'>
                                        <Menu.Item
                                            as="div"
                                            className="flex items-center flex-row hover:bg-main px-[10px] py-[5px] rounded-lg"
                                            onClick={() => {
                                                setSortOption({
                                                    option: "RATING",
                                                    alias: "Rating"
                                                })
                                            }}
                                        >
                                            <StarIcon className='h-5 w-5 mr-1' />
                                            Rating
                                        </Menu.Item>
                                        <Menu.Item
                                            as="div"
                                            className="flex items-center flex-row hover:bg-main px-[10px] py-[5px] rounded-lg"
                                            onClick={() => {
                                                setSortOption({
                                                    option: "NEWEST",
                                                    alias: "Newest"
                                                })
                                            }}
                                        >
                                            <BarsArrowUpIcon className='h-5 w-5 mr-1' />
                                            Newest
                                        </Menu.Item>
                                        <Menu.Item
                                            as="div"
                                            className="flex items-center flex-row hover:bg-main px-[10px] py-[5px] rounded-lg"
                                            onClick={() => {
                                                setSortOption({
                                                    option: "OLDEST",
                                                    alias: "Oldest"
                                                })
                                            }}
                                        >
                                            <BarsArrowDownIcon className='h-5 w-5 mr-1' />
                                            Oldest
                                        </Menu.Item>


                                    </div>
                                </Menu.Items>
                            </Menu>
                        </div>
                        <div className='bg-hr h-[1px] my-[10px]'></div>
                        <div>
                            {
                                userDecks && userDecks[0] && userDecks[0].length > 0 ?

                                    <div
                                        className="w-full grid gap-x-14 gap-y-9"
                                        style={{
                                            gridTemplateColumns: gridCols
                                        }}
                                    >
                                        {
                                            currentDecks.map((deck, index) => {
                                                let classname = "my-[10px]"
                                                return (
                                                    <div key={index} className={classname}>
                                                        <DeckChip deck={deck} width={340} />
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                    :
                                    <div className='text-textlight'>
                                        This user has not created any decks.
                                    </div>
                            }
                            <div className='w-full fc'>
                                <button
                                    onClick={() => { changePage("BACKWARDS") }}
                                >
                                    <ChevronLeftIcon className='h-5 w-5' />
                                </button>
                                <div className='rounded-lg bg-bgdark p-[5px]'>
                                    {deckPage + 1}
                                </div>
                                <button
                                    onClick={() => { changePage("FORWARDS") }}
                                >
                                    <ChevronRightIcon className='h-5 w-5' />
                                </button>
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
    )
}

export default DecksTab