import React from 'react'

import {
    ChevronDownIcon,
    UserCircleIcon,
    UserIcon,
    ArrowLeftOnRectangleIcon,
    UserPlusIcon,
    ArrowRightOnRectangleIcon,
    DocumentMagnifyingGlassIcon,
    DocumentPlusIcon,
    PlusCircleIcon,
    FolderIcon,
    AcademicCapIcon
} from '@heroicons/react/20/solid'

import { isLoggedIn } from '../utils/account'
import { getApiUrl } from '../utils/api'
import { Menu } from '@headlessui/react'
import { SH } from '../utils/storageHandler'

const NavigationBar = () => {
    const COMPACT_WIDTH = 700
    const [width, setWidth] = React.useState<number>(window.innerWidth)

    window.addEventListener("resize", () => {
        if (width > COMPACT_WIDTH && window.innerWidth < COMPACT_WIDTH) {
            setWidth(window.innerWidth)
        } else if (width < COMPACT_WIDTH && window.innerWidth > COMPACT_WIDTH) {
            setWidth(window.innerWidth)
        }
    })

    const handleSearchBar = (e: React.MouseEvent<HTMLFormElement>) => {
        e.preventDefault()
        const searchTerm = new FormData(e.currentTarget).get("search")
        const encoded = encodeURIComponent(searchTerm?.toString()!)
        location.href = `/decks/search?term=${encoded}&option=name`
    }

    const logout = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        const res = await fetch(getApiUrl() + "auth/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + SH.get("user").session.token
            },
            body: JSON.stringify({})
        })

        if (!res.ok) {
            SH.remove("user")
        } else {
            SH.remove("user")
            location.href = "/"
        }
    }

    if (width > COMPACT_WIDTH) {
        return (
            <div className="fc bg-bgdark rounded-lg p-[20px]  h-[88px]">
                <div className="text-2xl font-bold flex items-center w-2/5">
                    <Menu as="div" className="fc flex-col text-lg mx-[20px]">
                        <Menu.Button className="text-3xl fc">
                            <PlusCircleIcon
                                className="-mr-1 ml-2 h-10 w-10 text-white hover:text-main"
                                aria-hidden="true"
                            />
                        </Menu.Button>
                        <Menu.Items className="absolute top-[100px] left-0 bg-bgdark rounded-lg p-[10px] m-[10px] z-1">
                            <Menu.Item>
                                <a
                                    className="flex items-center flex-row hover:bg-main px-[10px] py-[5px] rounded-lg"
                                    href="/deck/create"
                                >
                                    <DocumentPlusIcon className='h-5 w-5 mr-1' />
                                    Create Deck
                                </a>
                            </Menu.Item>
                            <Menu.Item>
                                <a
                                    className="flex items-center flex-row hover:bg-main px-[10px] py-[5px] rounded-lg"
                                    href="/folders/create"
                                >
                                    <FolderIcon className='h-5 w-5 mr-1' />
                                    Create Folder
                                </a>
                            </Menu.Item>
                        </Menu.Items>
                    </Menu>
                    {
                        width > 1525 ?
                            <div>
                                {
                                    !location.pathname.includes("/decks") ?
                                        <div className='fc flex-row'>
                                            <div>
                                                <a href="/decks" className="mx-[20px] hover:text-main">Decks</a>
                                                <a href="/guides" className="mx-[20px] hover:text-main">Guides</a>
                                            </div>
                                            <form className='mx-[20px]' onSubmit={handleSearchBar}>
                                                <input name="search" type="text" placeholder='Search for decks' className='rounded-lg px-[5px] py-[2px] w-full my-[5px] bg-bgdark border-solid border-b-[1px] border-main outline-none' />
                                            </form>
                                        </div>
                                        :
                                        <div>

                                        </div>
                                }
                            </div>
                            :
                            <div>
                                <a href="/decks" className="mx-[20px] hover:text-main">Decks</a>
                                <a href="/guides" className="mx-[20px] hover:text-main">Guides</a>
                            </div>
                    }
                </div>



                <div className="text-5xl font-bold fc w-1/5 title"><a href="/">Cards</a></div>



                <div className="font-bold fc w-2/5">
                    {isLoggedIn() ?
                        <div className="flex items-center justify-end text-2xl w-full">
                            <Menu as="div" className="fc flex-col text-lg mx-[20px]">
                                <Menu.Button className="text-3xl fc">
                                    <UserCircleIcon
                                        className="-mr-1 ml-2 h-10 w-10 text-white hover:text-main"
                                        aria-hidden="true"
                                    />
                                </Menu.Button>
                                <Menu.Items className="absolute top-[100px] right-0 bg-bgdark rounded-lg p-[10px] m-[10px] z-1">
                                    <Menu.Item>
                                        <a
                                            className="flex items-center flex-row hover:bg-main px-[10px] py-[5px] rounded-lg w-full"
                                            href="/account"
                                        >
                                            <UserCircleIcon className='h-5 w-5 mr-1' />
                                            Dashboard
                                        </a>
                                    </Menu.Item>
                                    <Menu.Item>
                                        <a
                                            className="flex items-center flex-row hover:bg-main px-[10px] py-[5px] rounded-lg"
                                            href={"/user/" + SH.get("user").user.id}
                                        >
                                            <UserIcon className='h-5 w-5 mr-1' />
                                            Profile
                                        </a>
                                    </Menu.Item>
                                    <Menu.Item>
                                        <button
                                            className="flex items-center flex-row hover:bg-main px-[10px] py-[5px] rounded-lg w-full"
                                            onClick={logout}
                                        >
                                            <ArrowRightOnRectangleIcon className='h-5 w-5 mr-1' />
                                            Logout
                                        </button>
                                    </Menu.Item>
                                </Menu.Items>
                            </Menu>
                        </div>
                        :
                        <div className="flex items-center justify-end text-2xl w-full">
                            <a href="/account/register" className="mx-[10px] hover:text-main">Register</a>
                            <a href="/account/login" className="mx-[10px] hover:text-main">Login</a>
                        </div>}
                </div>
            </div>
        )



    } else {



        return (
            <div className='fc bg-bgdark rounded-lg p-[20px] h-[88px]'>
                <Menu as="div" className="fc flex-col text-lg">
                    <Menu.Button className="text-3xl fc">
                        <div className='title'>Cards</div>
                        <ChevronDownIcon
                            className="-mr-1 ml-2 h-5 w-5 text-white hover:text-main"
                            aria-hidden="true"
                        />
                    </Menu.Button>
                    <Menu.Items className="absolute top-[100px] bg-bgdark rounded-lg p-[10px] m-[10px] z-1">
                        <div className='flex flex-col'>
                            {isLoggedIn() ?
                                <div className='flex flex-col'>

                                    <Menu.Item>
                                        <a
                                            className="flex items-center flex-row hover:bg-main px-[10px] py-[5px] rounded-lg"
                                            href="/decks"
                                        >
                                            <DocumentMagnifyingGlassIcon className='h-5 w-5 mr-1' />
                                            Search Decks
                                        </a>
                                    </Menu.Item>
                                    <Menu.Item>
                                        <a
                                            className="flex items-center flex-row hover:bg-main px-[10px] py-[5px] rounded-lg"
                                            href="/deck/create"
                                        >
                                            <DocumentPlusIcon className='h-5 w-5 mr-1' />
                                            Create Deck
                                        </a>
                                    </Menu.Item>
                                    <Menu.Item>
                                        <a
                                            className="flex items-center flex-row hover:bg-main px-[10px] py-[5px] rounded-lg"
                                            href="/folders/create"
                                        >
                                            <FolderIcon className='h-5 w-5 mr-1' />
                                            Create Folder
                                        </a>
                                    </Menu.Item>
                                    <div className='my-[5px] bg-hr rounded-lg h-[1px]'></div>
                                    <Menu.Item>
                                        <a
                                            className="flex items-center flex-row hover:bg-main px-[10px] py-[5px] rounded-lg"
                                            href="/guides"
                                        >
                                            <AcademicCapIcon className='h-5 w-5 mr-1' />
                                            Guides
                                        </a>
                                    </Menu.Item>
                                    <div className='my-[5px] bg-hr rounded-lg h-[1px]'></div>

                                    <Menu.Item>
                                        <a
                                            className="flex items-center flex-row hover:bg-main px-[10px] py-[5px] rounded-lg"
                                            href="/account"
                                        >
                                            <UserCircleIcon className='h-5 w-5 mr-1' />
                                            Dashboard
                                        </a>
                                    </Menu.Item>
                                    <Menu.Item>
                                        <a
                                            className="flex items-center flex-row hover:bg-main px-[10px] py-[5px] rounded-lg"
                                            href={"/user/" + SH.get("user").user.id}
                                        >
                                            <UserIcon className='h-5 w-5 mr-1' />
                                            Profile
                                        </a>
                                    </Menu.Item>
                                    <div className='my-[5px] bg-hr rounded-lg h-[1px]'></div>
                                    <Menu.Item>
                                        <button
                                            className="flex items-center flex-row hover:bg-main px-[10px] py-[5px] rounded-lg w-full"
                                            onClick={logout}
                                        >
                                            <ArrowRightOnRectangleIcon className='h-5 w-5 mr-1' />
                                            Logout
                                        </button>
                                    </Menu.Item>
                                </div>
                                :
                                <div className='flex flex-col'>
                                    <Menu.Item>
                                        <a
                                            className="flex items-center hover:bg-main px-[10px] py-[5px] rounded-lg"
                                            href="/account/login"
                                        >
                                            <ArrowLeftOnRectangleIcon className='h-5 w-5 mr-1' />
                                            Login
                                        </a>
                                    </Menu.Item>
                                    <Menu.Item>
                                        <a
                                            className="flex items-center flex-row hover:bg-main px-[10px] py-[5px] rounded-lg"
                                            href="/account/register"
                                        >
                                            <UserPlusIcon className='h-5 w-5 mr-1' />
                                            Register
                                        </a>
                                    </Menu.Item>

                                </div>}
                        </div>
                    </Menu.Items>
                </Menu>
            </div >
        )
    }
}

export default NavigationBar
