type Props = {
    tags: string[]
};

export default function NewAddress({ tags }: Props) {
    return (
        <div>
            <h1>New Address</h1>
            <p>{JSON.stringify(tags)}</p>
        </div>
    )
}
