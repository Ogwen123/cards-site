export type Visibility = "PUBLIC" | "PRIVATE" | "UNLISED"

export const searchOptions = ["name", "topic", "tags", "description"] as const

export type SearchOption = typeof searchOptions[number]

export type Card = {
    id: string,
    front: string,
    back: string,
    deck_id: string,
    note?: string,
    updated_at: string
}

export type Tag = {
    id: string,
    name: string,
    deck: string
}

export type DeckUser = {
    id: string,
    username: string,
    perms: string[],
    updated_at: string
}

export type Deck = {
    id: string,
    name: string,
    topic: string,
    description: string,
    visibility: Visibility,
    score: number,
    updated_at: string,
    tags: Tag[],
    cards: Card[],
    user: DeckUser
}

export type DeckDraft = {
    id: string,
    name: string,
    topic: string,
    description: string,
    visibility: Visibility,
    score: number,
    updated_at: string,
    tags: string[],
    cards: Card[],
    user: DeckUser
}

export type DeckMeta = {
    id: string,
    name: string,
    topic: string,
    description: string,
    visibility: Visibility,
    score: number,
    updated_at: string,
    created_at: string
}

export type SearchResult = {
    deck: DeckMeta,
    score: number
}

export type WrittenQuestionT = {
    id: number,
    type: "WRITTEN" | "MUTLIPLE_CHOICE",
    question: string,
    answer: string,
    order: "TERM" | "DEFINITION"
}

export type MultipleChoiceQuestionT = {
    id: number,
    type: "WRITTEN" | "MUTLIPLE_CHOICE",
    question: string,
    options: {
        val: string,
        correct: boolean
    }[]
}

export type Test = (WrittenQuestionT | MultipleChoiceQuestionT)[]

export type User = {
    id: string,
    username: string,
    name: string,
    email: string
    perms: string[]
    created_at: string
}

export type OtherUser = {
    id: string,
    username: string,
    perms: string[]
    created_at: string
}

export type CardCreate = {
    front: string,
    back: string,
}

export type AlertData = [string | [string, string], "SUCCESS" | "ERROR", boolean]

export type SortOption = "RATING" | "NEWEST" | "OLDEST"

export type SortOptionObj = {
    option: SortOption,
    alias: "Rating" | "Newest" | "Oldest"
}

export type Details = {
    firstname: string,
    lastname: string,
    username: string,
    email: string,
    password: string
}