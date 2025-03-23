import React from "react"
import { ChromePicker } from "react-color"

interface DescriptionWriterProps {
    updateFunc: (desc: string) => void
}

const DescriptionWriter = ({ updateFunc }: DescriptionWriterProps) => {

    const [colour, setColour] = React.useState<string>("#ffffff")
    const [showPicker, setShowPicker] = React.useState<boolean>(false)
    const [effects, setEffects] = React.useState<{ start: number, end: number, val: string }[]>([])

    //const applyEffects = () => {

    //}

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.preventDefault()
        updateFunc(e.target.value)
    }

    const handleEffect = (e: React.MouseEvent<HTMLButtonElement>, type: "ITALIC" | "UNDERLINE" | "BOLD" | "COLOUR") => {
        e.preventDefault()
        const textarea: HTMLTextAreaElement = document.getElementById("description-input") as HTMLTextAreaElement
        const start = textarea.selectionStart
        const end = textarea.selectionEnd

        if (start === 0 && end === 0) {
            return
        }

        if (type === "COLOUR") {
            setEffects([...effects, { start: start, end: end, val: `COLOUR:${colour}` }])
        } else {
            setEffects([...effects, { start: start, end: end, val: type }])
        }
    }

    return (
        <div className="bg-bgdark rounded-lg my-[5px]">
            <textarea
                id="description-input"
                onChange={handleChange}
                className="resize-none bg-bgdark rounded-t-lg w-full h-[200px] outline-none p-[10px]"
                placeholder="Description"
            >

            </textarea>
            <div className='m-[5px] bg-hr rounded-lg h-[1px] min-w-[200px]'></div>
            <div className="bg-bgdark rounded-b-lg flex items-center flex-row px-[10px]">
                <button
                    className="blocky m-[10px] text-xl italic hover:text-main"
                    onMouseDown={(e) => { handleEffect(e, "ITALIC") }}
                >
                    I
                </button>
                <button
                    className="blocky m-[10px] text-xl underline hover:text-main"
                    onMouseDown={(e) => { handleEffect(e, "UNDERLINE") }}
                >
                    U
                </button>
                <button
                    className="blocky m-[10px] text-xl font-bold hover:text-main"
                    onMouseDown={(e) => { handleEffect(e, "BOLD") }}
                >
                    B
                </button>
                <div className="relative max-h-[50px]">
                    <button
                        className="m-[10px] w-[50px] rounded-lg p-[5px] h-[30px] mix-blend-difference"
                        style={{ backgroundColor: colour }}
                        onClick={(e) => { e.preventDefault(); setShowPicker(true) }}
                    >
                    </button>
                    {
                        showPicker ?
                            <ChromePicker
                                color={colour}
                                className="z-1 absolute top-[70px]"
                                onChangeComplete={(colour) => {
                                    setColour(colour.hex)
                                }}
                            />
                            :
                            <div></div>
                    }
                </div>
                {
                    showPicker ?
                        <button
                            className="rounded-lg bg-main p-[5px] h-[30px] w-[50px] text-sm hover:bg-maindark"
                            onClick={(e) => { handleEffect(e, "COLOUR") }}
                        >
                            Apply
                        </button>
                        :
                        <div></div>
                }
            </div>
        </div>
    )
}

export default DescriptionWriter