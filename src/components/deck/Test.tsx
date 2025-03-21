import React, { Fragment } from 'react'
import { title } from '../../utils/string'
import Alert from '../Alert'
import { getApiUrl } from '../../utils/api'
import { Card, Deck, AlertData } from '../../global/types'
import {
    Test,
    MultipleChoiceQuestionT,
    WrittenQuestionT
} from '../../global/types'
import WrittenQuestion from './components/WrittenQuestion'
import MultipleChoiceQuestion from './components/MultipleChoiceQuestion'
import {
    Dialog,
    Switch,
    Transition
} from '@headlessui/react'
import config from "../../config.json"

type MultipleChoiceAnswer = { questionIndex: number, correctSelected: boolean, optionString: string }

type Result = {
    question: string,
    answer: string,
    correct: boolean,
    correctAnswer?: string
}

type Results = {
    correct: number,
    incorrect: number,
    results: Result[]
}

type Setup = {
    questions: number,
    questionTypes: {
        MUTLIPLE_CHOICE: boolean,
        WRITTEN: boolean
    }
}

const Test = () => {
    const tabs = [
        {
            value: "flashcards",
            selected: false,
            link: "view"
        },
        {
            value: "test",
            selected: true,
            link: "test"
        },
        {
            value: "match",
            selected: false,
            link: "match"
        }
    ]

    const COMPACT_WIDTH = 700

    const [width, setWidth] = React.useState<number>(window.innerWidth)
    const [deck, setDeck] = React.useState<Deck>()
    const [id, setId] = React.useState<string>()
    const [alertData, setAlertData] = React.useState<AlertData>(["", false, "NONE"])
    const [loading, setLoading] = React.useState<boolean>(false)

    const [multipleChoiceAnswers, setMultipleChoiceAnswers] = React.useState<MultipleChoiceAnswer[]>([])
    const [setup, setSetup] = React.useState<Setup>({ questions: -1, questionTypes: { MUTLIPLE_CHOICE: true, WRITTEN: true } })
    const [test, setTest] = React.useState<Test>([])
    const [results, setResults] = React.useState<Results>()
    const [stage, setStage] = React.useState<"SETUP" | "TEST" | "RESULTS">("SETUP")
    const [startTime, setStartTime] = React.useState<number>(0)
    const [endTime, setEndTime] = React.useState<number>(0)

    const shuffle = (array: any[]) => {
        let currentIndex = array.length, randomIndex;

        while (currentIndex > 0) {

            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    React.useEffect(() => {
        const rawId = location.href.split("/").at(-2)
        if (isNaN(parseInt(rawId!))) {
            setAlertData(["The deck ID is invalid.", true, "ERROR"])
            setTimeout(() => {
                setAlertData(["", false, "NONE"])
            }, config.alertLength)
            return
        }
        setId(rawId!)
    }, [])

    React.useEffect(() => {
        const fetchDeck = async () => {
            const res = await fetch(getApiUrl() + "decks/" + id, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    //"Authorization": "Bearer " + SH.get("user").session.token
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
                setDeck(data)
            }
        }

        if (id) {
            fetchDeck().catch((e) => console.log(e))
        } else {
            return
        }
    }, [id])

    const makeMutlipleChoiceQuestion = (cards: Card[], index: number, element: Card): MultipleChoiceQuestionT => {
        let questionObj: MultipleChoiceQuestionT = {
            id: index,
            type: "MUTLIPLE_CHOICE",
            question: cards[index].front,
            options: [
                {
                    val: element.back,
                    correct: true
                }
            ]
        }
        // get random indexes for wrong answers
        const randomIndexes: number[] = []
        const limit = cards.length - 1 < 3 ? cards.length - 1 : 3
        while (randomIndexes.length < limit) {
            const randomIndex = Math.floor(Math.random() * cards.length)
            if (randomIndexes.includes(randomIndex) || randomIndex === index) continue
            randomIndexes.push(randomIndex)
        }
        for (let i of randomIndexes) {
            questionObj.options.push(
                {
                    val: cards[i].back,
                    correct: false
                }
            )
        }
        questionObj.options = shuffle(questionObj.options)
        return questionObj
    }

    const makeWrittenQuestion = (index: number, element: Card): WrittenQuestionT => {
        const type: "TERM" | "DEFINITION" = Math.floor(Math.random()) > 0.5 ? "TERM" : "DEFINITION"
        let questionObj: WrittenQuestionT = {
            id: index,
            type: "WRITTEN",
            question: "",
            answer: "",
            order: type
        }
        if (type === "TERM") {
            questionObj.question = element.front
            questionObj.answer = element.back
        } else {
            questionObj.question = element.back
            questionObj.answer = element.front
        }
        return questionObj
    }

    React.useEffect(() => {
        if (stage !== "TEST") return
        const data = deck as Deck
        const testArr: Test = []
        const cards: Card[] = shuffle(data.cards).slice(0, setup.questions)
        const mid = Math.floor((setup.questions - 1) / 2)
        // make the test
        if (setup.questionTypes.MUTLIPLE_CHOICE === true && setup.questionTypes.WRITTEN === false) {
            for (const [index, element] of cards.entries()) { // does the same things as python enumerate
                testArr.push(makeMutlipleChoiceQuestion(cards, index, element))
                setMultipleChoiceAnswers((prevAnswers) => ([...prevAnswers, { questionIndex: index, correctSelected: false, optionString: "" }]))
            }
        } else if (setup.questionTypes.MUTLIPLE_CHOICE === false && setup.questionTypes.WRITTEN === true) {
            for (const [index, element] of cards.entries()) { // does the same things as python enumerate
                testArr.push(makeWrittenQuestion(index, element))
            }
        } else if (setup.questionTypes.MUTLIPLE_CHOICE === true && setup.questionTypes.WRITTEN === true) {
            for (const [index, element] of cards.entries()) { // does the same things as python enumerate
                if (index > mid) {
                    testArr.push(makeMutlipleChoiceQuestion(cards, index, element))
                    setMultipleChoiceAnswers((prevAnswers) => ([...prevAnswers, { questionIndex: index, correctSelected: false, optionString: "" }]))
                } else {
                    testArr.push(makeWrittenQuestion(index, element))
                }
            }
        } else {
            return
        }

        setTest(testArr)
        setStartTime(Date.now())
    }, [stage])

    window.addEventListener("resize", () => {
        if (width > COMPACT_WIDTH && window.innerWidth < COMPACT_WIDTH) {
            setWidth(window.innerWidth)
        } else if (width < COMPACT_WIDTH && window.innerWidth > COMPACT_WIDTH) {
            setWidth(window.innerWidth)
        }
    })

    const updateMutlipleChoiceAnswers = (questionIndex: number, correctOption: boolean, optionString: string) => {
        let newArr: MultipleChoiceAnswer[] = []
        for (let i of multipleChoiceAnswers) {
            if (i.questionIndex === questionIndex) {
                newArr.push({
                    questionIndex: questionIndex,
                    correctSelected: correctOption,
                    optionString: optionString
                })
            } else {
                newArr.push(i)
            }
        }
        setMultipleChoiceAnswers(newArr)
    }

    const submit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setLoading(true)
        let correct = 0
        let incorrect = 0
        const resultsArr: Result[] = []
        for (let i of test) {
            if (i.type === "MUTLIPLE_CHOICE") {

                i = i as MultipleChoiceQuestionT
                let answer = ""
                for (let j of i.options) {
                    if (j.correct) {
                        answer = j.val
                        break
                    }
                }
                let isCorrect = false
                let theirAnswer = ""
                for (let j of multipleChoiceAnswers) {
                    if (j.questionIndex === i.id) {
                        isCorrect = j.correctSelected
                        theirAnswer = j.optionString
                    }
                }
                const newResult: Result = {
                    question: i.question,
                    answer: theirAnswer,
                    correct: isCorrect
                }
                if (!isCorrect) {
                    incorrect++
                    newResult.correctAnswer = answer
                } else correct++

                resultsArr.push(newResult)
            } else {
                i = i as WrittenQuestionT
                const answer: string = ((document.getElementById("written-answer-" + i.id) as HTMLInputElement)!.value === null ? "" : (document.getElementById("written-answer-" + i.id) as HTMLInputElement)!.value)
                const newResult: Result = {
                    question: i.question,
                    answer: answer,
                    correct: (answer.toLowerCase() === i.answer.toLowerCase())
                }
                if (!newResult.correct) {
                    incorrect++
                    newResult.correctAnswer = i.answer
                } else correct++

                resultsArr.push(newResult)
            }
        }
        setResults({
            correct: correct,
            incorrect: incorrect,
            results: resultsArr
        })
        setStage("RESULTS")
        setLoading(false)
        setEndTime(Date.now())
    }

    const covertTime = (millis: number) => {
        const minutes = Math.floor(millis / 60000)
        const seconds = Math.round(((millis % 60000) / 1000))
        if (minutes > 0) {
            const returnString = (seconds == 60 ?
                (minutes + 1) + ":00" :
                minutes + ":" + (seconds < 10 ? "0" : "") + seconds) + " minutes"
            return returnString
        } else {
            return seconds + " seconds"
        }
    }

    return (
        <div className='flex items-center flex-col py-[10px]'>
            <Alert message={alertData[0]} show={alertData[1]} severity={alertData[2]} />
            {
                id ?
                    <div className='w-full'>
                        {
                            deck ?
                                <div>
                                    {
                                        stage === "TEST" || stage === "SETUP" ?
                                            <div>
                                                <Transition appear show={stage === "SETUP"} as={Fragment}>
                                                    <Dialog as="div" className="relative z-10" onClose={() => { }}>
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
                                                                            Setup the test
                                                                        </Dialog.Title>
                                                                        <div className="mt-2">
                                                                            <div id="setup-alert">

                                                                            </div>
                                                                            <div className='flex flex-row'>
                                                                                <div className='w-3/4 flex items-center flex-row'>
                                                                                    Question Count
                                                                                    <div className='text-sm text-textlight '>
                                                                                        &nbsp;(Max {deck.cards.length})
                                                                                    </div>
                                                                                </div>
                                                                                <input
                                                                                    type="number"
                                                                                    defaultValue={deck.cards.length}
                                                                                    className='rounded-lg bg-bg w-1/4 px-[10px] py-[5px] outline-none'
                                                                                    max={deck.cards.length}
                                                                                    min={1}
                                                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                                        const newVal = (isNaN(parseInt(e.target.value)) ? 1 : parseInt(e.target.value))
                                                                                        setSetup((prevSetup) => ({
                                                                                            questions: newVal,
                                                                                            questionTypes: prevSetup.questionTypes
                                                                                        }))
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                            <div className='my-[5px] bg-hr rounded-lg h-[2px]'></div>
                                                                            <div >
                                                                                Question Types
                                                                            </div>
                                                                            <div className='my-[5px] bg-bg rounded-lg h-[1px]'></div>
                                                                            <div className='flex flex-row my-[10px]'>
                                                                                <div className='mr-auto'>Mutliple Choice</div>
                                                                                <Switch
                                                                                    checked={setup.questionTypes.MUTLIPLE_CHOICE}
                                                                                    onChange={() => {
                                                                                        setSetup((prevSetup) => ({
                                                                                            questions: prevSetup.questions,
                                                                                            questionTypes: {
                                                                                                MUTLIPLE_CHOICE: !prevSetup.questionTypes.MUTLIPLE_CHOICE,
                                                                                                WRITTEN: prevSetup.questionTypes.WRITTEN
                                                                                            }
                                                                                        }))
                                                                                    }}
                                                                                    className={`${setup.questionTypes.MUTLIPLE_CHOICE ? 'bg-main' : 'bg-hr'
                                                                                        } relative inline-flex h-6 w-11 items-center rounded-full`}
                                                                                >
                                                                                    <span className="sr-only">Enable notifications</span>
                                                                                    <span
                                                                                        className={`${setup.questionTypes.MUTLIPLE_CHOICE ? 'translate-x-6' : 'translate-x-1'
                                                                                            } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                                                                                    />
                                                                                </Switch>
                                                                            </div>
                                                                            <div className='flex flex-row my-[10px]'>
                                                                                <div className='mr-auto'>Written</div>
                                                                                <Switch
                                                                                    checked={setup.questionTypes.WRITTEN}
                                                                                    onChange={() => {
                                                                                        setSetup((prevSetup) => ({
                                                                                            questions: prevSetup.questions,
                                                                                            questionTypes: {
                                                                                                MUTLIPLE_CHOICE: prevSetup.questionTypes.MUTLIPLE_CHOICE,
                                                                                                WRITTEN: !prevSetup.questionTypes.WRITTEN
                                                                                            }
                                                                                        }))
                                                                                    }}

                                                                                    className={`${setup.questionTypes.WRITTEN ? 'bg-main' : 'bg-hr'
                                                                                        } relative inline-flex h-6 w-11 items-center rounded-full`}
                                                                                >
                                                                                    <span className="sr-only">Enable notifications</span>
                                                                                    <span
                                                                                        className={`${setup.questionTypes.WRITTEN ? 'translate-x-6' : 'translate-x-1'
                                                                                            } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                                                                                    />
                                                                                </Switch>
                                                                            </div>
                                                                        </div>

                                                                        <div className="mt-4 flex flex-col">
                                                                            <button
                                                                                className="button mr-[5px] outline-none"
                                                                                onClick={() => {
                                                                                    if (setup.questionTypes.MUTLIPLE_CHOICE === false && setup.questionTypes.WRITTEN === false) {
                                                                                        (document.getElementById("setup-alert") as HTMLDivElement).innerText = "Select at least one question type to proceed.";

                                                                                        (document.getElementById("setup-alert") as HTMLDivElement).className = "rounded-lg h-[44px] bg-error w-full fc my-[5px]"
                                                                                        setTimeout(() => {
                                                                                            (document.getElementById("setup-alert") as HTMLDivElement).innerText = "";

                                                                                            (document.getElementById("setup-alert") as HTMLDivElement).className = ""
                                                                                        }, 3000)
                                                                                        return
                                                                                    }
                                                                                    if (setup.questions > deck.cards.length || setup.questions < 1) {
                                                                                        setSetup((prevSetup) => ({
                                                                                            questions: deck.cards.length,
                                                                                            questionTypes: prevSetup.questionTypes
                                                                                        }))
                                                                                    }
                                                                                    setStage("TEST")
                                                                                }}
                                                                            >
                                                                                Proceed to the test
                                                                            </button>
                                                                        </div>
                                                                    </Dialog.Panel>
                                                                </Transition.Child>
                                                            </div>
                                                        </div>
                                                    </Dialog>
                                                </Transition>



                                                <div className='w-full my-[10px] flex items-center flex-col'>
                                                    <div className={
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
                                                        {
                                                            test.map((val, index) => {
                                                                return (
                                                                    <div key={index} className='w-full'>
                                                                        {
                                                                            val.type === "WRITTEN" ?
                                                                                <WrittenQuestion
                                                                                    question={val as WrittenQuestionT}
                                                                                />
                                                                                :
                                                                                <MultipleChoiceQuestion
                                                                                    question={val as MultipleChoiceQuestionT}
                                                                                    updateMutlipleChoiceAnswers={updateMutlipleChoiceAnswers}
                                                                                />
                                                                        }
                                                                    </div>
                                                                )
                                                            })
                                                        }
                                                        {
                                                            stage === "TEST" &&
                                                            <button onClick={submit} className='button flex justify-center my-[10px]'>{loading ?
                                                                <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-bg" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                                                </svg>
                                                                :
                                                                "Submit"}</button>
                                                        }

                                                    </div>
                                                </div>
                                            </div>
                                            :
                                            <div className='w-full flex justify-center'>
                                                {
                                                    results ?
                                                        <div className='w-3/5'>
                                                            <div className='text-2xl w-full fc'>Your Results</div>
                                                            <div className='w-full mt-[10px]'>
                                                                <div className='flex flex-row'>
                                                                    <div className='flex flex-row items-center text-xl w-1/2'>
                                                                        <div className='text-success mr-[10px]'>Correct</div>
                                                                        {results.correct}
                                                                        <div className='text-base text-textlight ml-[10px]'>
                                                                            ({Math.round((results.correct / (results.correct + results.incorrect) * 100) * 10) / 10} %)
                                                                        </div>
                                                                    </div>
                                                                    <div className='flex flex-row items-center text-xl w-1/2'>
                                                                        <div className='text-error mr-[10px]'>Incorrect</div>
                                                                        {results.incorrect}
                                                                        <div className='text-base text-textlight ml-[10px]'>
                                                                            ({Math.round((results.incorrect / (results.correct + results.incorrect) * 100) * 10) / 10} %)
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div
                                                                        className='w-full h-[10px] bg-bgdark rounded-lg flex flex-row'
                                                                    >
                                                                        <div
                                                                            className="bg-success h-[10px] rounded-l-lg"
                                                                            style={{
                                                                                width: `${Math.max(results.correct / (results.results.length) * 100, 0.5)}%`
                                                                            }}
                                                                        >

                                                                        </div>
                                                                        <div
                                                                            className="bg-error h-[10px] rounded-r-lg"
                                                                            style={{
                                                                                width: `${Math.max(results.incorrect / (results.results.length) * 100, 0.5)}%`,
                                                                            }}
                                                                        >

                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className='my-[20px] bg-hr rounded-lg h-[2px]'></div>
                                                            <div className='flex flex-col text-lg'>
                                                                <div className='flex items-center flex-row'>
                                                                    Time taken: <div className='text-main ml-[10px]'>{covertTime(endTime - startTime)}</div>
                                                                </div>
                                                                <div className='flex items-center flex-row'>
                                                                    Average time per question: <div className='text-main ml-[10px]'>{covertTime((endTime - startTime) / results.results.length)}</div>
                                                                </div>
                                                            </div>
                                                            <div className='my-[20px] bg-hr rounded-lg h-[2px]'></div>
                                                            <div>
                                                                {results.results.map((val, index) => {
                                                                    return (
                                                                        <div className='w-full rounded-lg bg-bgdark p-[10px] mt-[10px]' key={index}>
                                                                            <div className='w-full flex flex-col p-[10px]'>
                                                                                <div className='text-sm text-textlight'>
                                                                                    The question was
                                                                                </div>
                                                                                <div className='text-lg'>
                                                                                    {val.question}
                                                                                </div>
                                                                            </div>
                                                                            <div className='w-full p-[10px]'>
                                                                                {
                                                                                    val.answer !== "" ?
                                                                                        <div>
                                                                                            <div className='text-sm text-textlight flex items-center'>
                                                                                                Your answer was
                                                                                            </div>
                                                                                            <div className={
                                                                                                val.correct ?
                                                                                                    "text-success"
                                                                                                    :
                                                                                                    "text-error"
                                                                                            }>{val.answer}</div>
                                                                                        </div>
                                                                                        :
                                                                                        <div className='text-error'>
                                                                                            You did not answer
                                                                                        </div>
                                                                                }
                                                                            </div>
                                                                            {
                                                                                !val.correct &&
                                                                                <div className='w-full p-[10px]'>
                                                                                    <div className='text-sm text-textlight flex items-center'>
                                                                                        The correct answer is
                                                                                    </div>
                                                                                    {val.correctAnswer}

                                                                                </div>
                                                                            }
                                                                        </div >
                                                                    )
                                                                })}
                                                            </div>
                                                            <button
                                                                className="button bg-warning hover:bg-warningdark outline-none mt-[10px]"
                                                                onClick={() => { location.href = `/deck/${id}/view` }}
                                                            >
                                                                Leave
                                                            </button>
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
                                    }
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

export default Test