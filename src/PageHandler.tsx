
import { Outlet } from 'react-router-dom'
import NavigationBar from './components/NavigationBar'
import Footer from './components/Footer'


const PageHandler = () => {
    return (
        <div>
            <div className="mh-all">
                <NavigationBar />
                <Outlet />
            </div>
            <Footer />
        </div>

    )
}

export default PageHandler