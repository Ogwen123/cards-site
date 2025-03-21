// import React from "react"
import { Route, Routes } from 'react-router-dom'

import Home from './components/Home'
import PageHandler from './PageHandler'
import RouteGuard from './RouteGuard'
import Register from './components/account/Register'
import Login from './components/account/Login'
import Dashboard from './components/account/Dashboard'
import Onboarding from './components/account/Onboarding'
import NotFound from './components/NotFound'
import DecksIndex from './components/decks/Index'
import DecksSearch from './components/decks/Search'
import DeckCreate from './components/deck/Create'
import DeckView from "./components/deck/View"
import DeckTest from './components/deck/Test'
import DeckMatch from './components/deck/Match'
import UserIndex from "./components/user/Index"
import DeckEdit from "./components/deck/Edit"

// guides
import GuideIndex from "./components/guide/Index"
import QuizletExportGuide from './components/guide/QuizletExport'


/*
declare global {
    interface Window { theme: Theme }
}
*/

const App = () => {

    /*
    React.useEffect(() => {
        window.theme = { mainColour: "#009788", mainDarkColor: "#00645a" }
    }, [])
    */

    return (
        <div className=''>
            <Routes>
                <Route path="/" element={<PageHandler />}>
                    <Route index element={<Home />} />

                    <Route
                        path="/account"
                        element={<RouteGuard page={<Dashboard />} conditions={["LOGGED_IN"]} perm='USER' />}
                    />

                    <Route
                        path="/account/register"
                        element={<RouteGuard page={<Register />} conditions={["NOT_LOGGED_IN"]} />}
                    />

                    <Route
                        path="/account/onboarding"
                        element={<RouteGuard page={<Onboarding />} conditions={["NOT_LOGGED_IN"]} />}
                    />

                    <Route
                        path="/account/login"
                        element={<RouteGuard page={<Login />} conditions={["NOT_LOGGED_IN"]} />}
                    />

                    <Route
                        path="/decks"
                        element={<DecksIndex />}
                    />

                    <Route
                        path="/decks/search"
                        element={<DecksSearch />}
                    />

                    <Route
                        path="/deck/create"
                        element={<RouteGuard page={<DeckCreate />} conditions={["LOGGED_IN"]} perm='USER' />}
                    />

                    <Route
                        path="/deck/edit"
                        element={<RouteGuard page={<DeckCreate />} conditions={["LOGGED_IN"]} perm='USER' />}
                    />

                    <Route
                        path="/deck/:id/view/"
                        element={<DeckView />}
                    />

                    <Route
                        path="/deck/:id/test"
                        element={<DeckTest />}
                    />

                    <Route
                        path="/deck/:id/match"
                        element={<DeckMatch />}
                    />

                    <Route
                        path="/deck/:id/edit"
                        element={<DeckEdit />}
                    />

                    <Route
                        path="/user/:id"
                        element={<UserIndex />}
                    />

                    <Route
                        path="/guide/quizlet-export"
                        element={<QuizletExportGuide />}
                    />

                    <Route
                        path="/guides"
                        element={<GuideIndex />}
                    />

                    <Route
                        path='*'
                        element={<NotFound />}
                    />
                </Route>
            </Routes>
        </div>
    )
}

export default App
