export default function Loading() {
    return (
        <div
            style={{
                minHeight: "60vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <div
                style={{
                    width: 36,
                    height: 36,
                    border: "3px solid rgba(99,102,241,0.2)",
                    borderTopColor: "var(--brand)",
                    borderRadius: "50%",
                }}
                className="animate-spin"
            />
        </div>
    );
}
