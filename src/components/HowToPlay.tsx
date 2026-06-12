/**
 * The rules, short enough to read while the next match loads.
 */

interface HowToPlayProps {
    onPlay: () => void;
    onHome: () => void;
}

const HowToPlay = ({ onPlay, onHome }: HowToPlayProps) => (
    <div className="page">
        <header className="page-head">
            <button className="ghost-btn" onClick={onHome} aria-label="Back to home">
                ←
            </button>
            <h1 className="page-title">How to play</h1>
        </header>

        <div className="page-body">
            <ol className="rules">
                <li>
                    The board starts split: your warm half below, the night above. Balls flip
                    every tile they touch on enemy ground.
                </li>
                <li>
                    Move your paddle with your mouse or finger. Slam <em>your</em> amber ball to
                    send it deeper and faster; meet the night ball to cushion it away.
                </li>
                <li>
                    Clean returns build a streak, and each one adds speed. A ball slipping past
                    you only resets the streak. Nothing else is lost.
                </li>
                <li>After 90 seconds, whoever holds more of the board wins.</li>
            </ol>

            <p className="page-note">
                Esc pauses. M toggles sound. Enter restarts when a match ends.
            </p>

            <button className="btn btn-play" onClick={onPlay}>
                Play
            </button>
        </div>
    </div>
);

export default HowToPlay;
