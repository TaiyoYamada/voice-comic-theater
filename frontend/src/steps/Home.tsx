import { Ruby } from '../components/Furigana'
import { Mascot } from '../components/Mascot'

/** 起動時のホーム（タイトル）画面。教育系キッズアプリ風。 */
export function Home({ onStart }: { onStart: () => void }) {
  return (
    <div className="home">
      {/* 背景のカラフルな丸（ブランド10色のうち数色） */}
      <div className="home-blobs" aria-hidden>
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
        <span className="blob b4" />
      </div>

      <div className="home-inner">
        <Mascot />
        <h1 className="home-title">コエコミ</h1>
        <p className="home-tagline">
          <Ruby text="自分(じぶん)の声(こえ)で 4コマ劇場(げきじょう)を 作(つく)ろう！" />
        </p>

        <button className="btn big home-start" onClick={onStart}>
          <Ruby text="作(つく)ってみよう！" />
        </button>
      </div>
    </div>
  )
}
