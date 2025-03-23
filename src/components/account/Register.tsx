import React from 'react'
import { AlertData, Details } from '../../global/types'
import LoadingWheel from '../LoadingWheel'
import Alert, { alertReset } from '../Alert'
import { getApiUrl } from '../../utils/api'

const Register = () => {

    const [details, setDetails] = React.useState<Details>({ firstname: "", lastname: "", username: "", email: "", password: "" })

    const [alert, setAlert] = React.useState<AlertData>(["Alert", "ERROR", false])
    const [passwordConfirmation, setPasswordConfirmation] = React.useState<string>("")
    const [submitting, setSubmitting] = React.useState<boolean>(false)

    const submit = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.code === "Enter") {
            register()
        }
    }

    const register = () => {
        setSubmitting(true)

        if (details.password !== passwordConfirmation) {
            setAlert([["Registration Successful", "You will now be redirected to the login page."], "SUCCESS", true])
            setSubmitting(false)
            setTimeout(() => {
                setAlert(alertReset)
            }, 500)
        }

        fetch(getApiUrl("auth") + "register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: details.firstname + " " + details.lastname,
                username: details.username,
                email: details.email,
                password: details.password
            })
        }).then((res) => {
            if (!res.ok) {
                res.json().then((data) => {
                    let error = ""
                    if (data.error instanceof Array) {
                        error = data.error[0]
                    } else {
                        error = data.error
                    }

                    setAlert([["Registration Fail", error], "ERROR", true])
                    setSubmitting(false)
                })
            } else {
                res.json().then(() => {
                    setAlert([["Registration Successful", "You will now be redirected to the login page."], "SUCCESS", true])
                    setSubmitting(false)
                    setTimeout(() => {
                        setAlert(alertReset)
                        location.href = "/account/login"
                    }, 500)
                })
            }
        }).catch((err) => {
            console.log(err)
            setSubmitting(false)
        })
    }

    return (
        <div className='gradient page-full fc overflow-y-auto'>
            <div className='w-[calc(40%-40px)] min-w-[320px] bg-bg bg-opacity-90 border border-white/5 rounded-md shadow-3xl flex flex-col items-center justify-center pb-[30px] pt-[30px] mt-[30px]'>

                <Alert
                    content={alert[0] instanceof Array ? alert[0][1] : alert[0]}
                    severity={alert[1]}
                    show={alert[2]}
                    title={alert[0] instanceof Array ? alert[0][0] : undefined}
                    width="80%"
                />
                <a href="/" className='gradienttext text-center text-4xl'>
                    Tracker
                </a>
                <div className=' text-subtext'>
                    Register a free account on Cards.
                </div>
                <div className='text-sm text-hr mb-[40px]'>Accounts are shared across all *.ogwen.eu.org websites.</div>
                <div className='flex flex-row w-[80%]'>
                    <input
                        type='text'
                        className='rounded-md bg-bgdark m-[5px] ml-0 flex-grow min-w-[150px] p-[10px]'
                        placeholder='Firstname'
                        value={details.firstname}
                        onChange={(e) => setDetails((prev) => ({ ...prev, firstname: e.target.value }))}
                        onKeyDown={submit}
                    />
                    <input
                        type='text'
                        className='rounded-md bg-bgdark m-[5px] mr-0 flex-grow min-w-[150px] p-[10px]'
                        placeholder='Lastname'
                        value={details.lastname}
                        onChange={(e) => setDetails((prev) => ({ ...prev, lastname: e.target.value }))}
                        onKeyDown={submit}
                    />
                </div>
                <input
                    type='text'
                    className='rounded-md bg-bgdark m-[5px] w-[80%] min-w-[300px] p-[10px]'
                    placeholder='Username'
                    value={details.username}
                    onChange={(e) => setDetails((prev) => ({ ...prev, username: e.target.value }))}
                    onKeyDown={submit}
                />
                <input
                    type='text'
                    className='rounded-md bg-bgdark m-[5px] w-[80%] min-w-[300px] p-[10px]'
                    placeholder='Email'
                    value={details.email}
                    onChange={(e) => setDetails((prev) => ({ ...prev, email: e.target.value }))}
                    onKeyDown={submit}
                />
                <input
                    type='password'
                    className='rounded-md bg-bgdark m-[5px] w-[80%] min-w-[300px] p-[10px]'
                    placeholder='Password'
                    value={details.password}
                    onChange={(e) => setDetails((prev) => ({ ...prev, password: e.target.value }))}
                    onKeyDown={submit}
                />
                <input
                    type='password'
                    className='rounded-md bg-bgdark m-[5px] w-[80%] min-w-[300px] p-[10px]'
                    placeholder='Confirm Password'
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    onKeyDown={submit}
                />

                <div className='text-subtext'>
                    <div className={(details.password.length >= 8 ? "text-success/85" : "text-subtext")}>• 8 or more characters in length</div>
                    <div className={(/(?=.*[A-Z])/.test(details.password) ? "text-success/85" : "text-subtext")}>• At least 1 uppercase letter</div>
                    <div className={(/(?=.*[a-z])/.test(details.password) ? "text-success/85" : "text-subtext")}>• At least 1 lowercase letter</div>
                    <div className={(/(?=.*[\d])/.test(details.password) ? "text-success/85" : "text-subtext")}>• At least 1 digit</div>
                </div>

                <button
                    onClick={() => register()}
                    className='bg-main rounded-md p-[10px] m-[15px] w-[80%] min-w-[300px]'
                >
                    {
                        submitting ?
                            <LoadingWheel size={24} />
                            :
                            "Register"
                    }
                </button>
            </div>
        </div>
    )
}

export default Register