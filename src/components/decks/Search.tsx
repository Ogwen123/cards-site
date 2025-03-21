import React from 'react'

import { Listbox } from '@headlessui/react'
import { title } from '../../utils/string'
import {
    CheckIcon,
    ChevronDownIcon
} from '@heroicons/react/20/solid'

import { Navigate } from "react-router-dom"
import URI from "../../utils/uri"
import Alert from '../Alert'
import { getApiUrl } from '../../utils/api'
import {
    SearchResult,
    SearchOption,
    AlertData
} from '../../global/types'
import DeckChip from '../DeckChip'
import config from "../../config.json"


const Search = () => {

    const searchOptions: { id: number, option: SearchOption }[] = [
        { id: 0, option: "name" },
        { id: 1, option: "topic" },
        { id: 2, option: "tags" },
        { id: 3, option: "description" },
    ]

    const [selectedOption, setSelectedOption] = React.useState<{ id: number, option: SearchOption }>(searchOptions[0])
    const [loading, setLoading] = React.useState<boolean>(true)
    const [alertData, setAlertData] = React.useState<AlertData>(["", false, "NONE"])
    const [results, setResults] = React.useState<SearchResult[]>([])

    const uriParams = new URI(location.href)

    React.useEffect(() => {
        if (uriParams.hasParams(["term", "option"])) {
            search(uriParams.get("term")!, uriParams.get("option")!)
        }
    }, [])

    const search = async (term: string, option: string) => {
        let body: { [key: string]: string | string[] } = {}
        if (option !== "tags") {
            body[option] = term
        }
        let tags = []
        if (selectedOption.option === "tags") {
            for (let i of term.split(",")) {
                tags.push(i.trim().replaceAll(" ", "-"))
            }
        } else {
            tags.push(term.trim().replaceAll(" ", "-"))
        }
        const res = await fetch(getApiUrl() + "decks/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                //"Authorization": "Bearer " + SH.get("user").session.token
            },
            body: JSON.stringify({ ...body, "tags": tags })
        })
        const data = await res.json()

        if (!res.ok) {
            setAlertData([data.error ? data.error : data.field_errors[0].message, true, "ERROR"])
            setTimeout(() => {
                setAlertData(["", false, "NONE"])
            }, config.alertLength)
            setLoading(false)
            return
        } else {
            let sortedData = data.sort(
                (d1: SearchResult, d2: SearchResult) => { // sort by match score, if they have equal match score sort by upvote/downvote score
                    return (d1.score < d2.score)
                        ? 1
                        : (d1.score > d2.score)
                            ? -1
                            : (d1.deck.score < d2.deck.score)
                                ? 1
                                : (d1.deck.score > d2.deck.score)
                                    ? -1
                                    : 0
                });
            setResults(sortedData)
            setLoading(false)
        }
        setLoading(false)
    }

    const handleSearch = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        const term = new FormData(e.currentTarget.parentElement as HTMLFormElement).get("search")?.toString()!
        if (term === "") {
            setAlertData(["Make sure you enter something in the search bar.", true, "ERROR"])
            setTimeout(() => {
                setAlertData(["", false, "NONE"])
            }, 500000)
            return
        }
        if (term === uriParams.get("term")) {
            return
        }
        setLoading(true)
        const encodedTerm = encodeURIComponent(term)
        const encodedOption = encodeURIComponent(selectedOption.option)
        location.href = "/decks/search?term=" + encodedTerm + "&option=" + encodedOption
    }

    if (uriParams.hasParams(["term", "option"]) && uriParams.get("term") !== "" && uriParams.get("option") !== "") {
        return (
            <div className='fc flex-col py-[10px]'>
                <Alert message={alertData[0]} show={alertData[1]} severity={alertData[2]} />
                <div className='w-full'>{/* search bar */}
                    <form className='my-[10px]'>
                        <div className='fc flex-row'>
                            <Listbox
                                as="div"
                                value={selectedOption}
                                onChange={setSelectedOption}
                                className="h-[49px] w-[130px] mb-[5px]"
                            >
                                <Listbox.Button
                                    className="bg-bgdark hover:bg-main fc flex-row h-full w-full rounded-l-lg"
                                >
                                    {title(selectedOption.option)}
                                    <ChevronDownIcon className='h-5 w-5' />
                                </Listbox.Button>
                                <Listbox.Options className="absolute z-1 top-[172px] left-[10px] bg-bgdark p-[20px] rounded-lg">
                                    {searchOptions.map((option) => (
                                        <Listbox.Option
                                            key={option.id}
                                            value={option}
                                            className="hover:bg-maindark rounded-lg p-[5px] pr-[15px] flex flex-row"
                                        >
                                            <div className='fc'>
                                                {option.id === selectedOption.id ? <CheckIcon className='h-5 w-5 mr-[5px]' /> : <div className='w-5 h-5 mr-[5px]'></div>}</div>
                                            {title(option.option)}
                                            <div className='w-5 h-5 mr-[5px]'></div>
                                        </Listbox.Option>
                                    ))}
                                </Listbox.Options>
                            </Listbox>
                            <input name="search" type="text" placeholder='Search for decks' className='form-input mb-[5px] mt-0 w-full h-[49px] rounded-l-none' defaultValue={uriParams.get("term")!} />
                        </div>
                        {
                            selectedOption.option === "tags" ?
                                <div className='text-xs opacity-75'>Seperate multiple tags using commas</div>
                                :
                                <div></div>
                        }
                        <button onClick={handleSearch} className='button flex justify-center'>{loading ?
                            <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-bg" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                            </svg>
                            :
                            "Search"}</button>
                    </form>
                </div>
                <div className='w-full flex flex-wrap'>{/* search results */}
                    {
                        results.length === 0 && !loading ?
                            <div>
                                There were no decks matching your search parameters.
                            </div>
                            :
                            <div className='w-full flex flex-wrap'>
                                {
                                    results.map((deck, index) => {
                                        return (
                                            <div key={index} className='mr-[40px] my-[10px]'>
                                                <DeckChip deck={deck.deck} score={deck.score} />
                                            </div>
                                        )
                                    })
                                }
                            </div>
                    }
                </div>
            </div>
        )
    } else {
        return (
            <Navigate to="/decks" />
        )
    }
}

export default Search