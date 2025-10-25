console.log('Back to Basics');
let songs;
let currentsong = new Audio()
let currFolder;
function formatTime(seconds) {
    let hours = Math.floor(seconds / 3600)
    let minutes = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);

    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (secs < 10) secs = "0" + secs;

    return `${minutes}:${secs}`;
}


async function getsongs(folder) {
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            let decoded = decodeURI(element.href);
            decoded = decoded.replace(/\\/g, "/");
            let songName = decoded.split(`/${folder}/`)[1];
            songs.push(songName);

            // songs.push(element.href.split("/%5Csongs%5C")[1]);
            // songs.push(element.href.split("http://127.0.0.1:3000/%5Csongs%5C")[1].replaceAll("%20", " "));
            // songs.push(element.href.split("/songs/"));

        }
    }

    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML += `<li><img class="invert" src="images/music.svg" alt="music">
                            <div class="info">
                                <div>${song}</div>
                                <div>kuldeep</div>
                            </div>
                            <div class="playnow">
                                <img class="invert" src="images/playnow.svg" alt="playnow">
                            </div>
        </li>`;
    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playmusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
    })
    return songs;
}

playmusic = (name, pause = false) => {
    // let audio = new Audio("/songs/"+line)
    currentsong.src = `/${currFolder}/` + name
    if (!pause) {
        currentsong.play()
        play.src = "images/pause.svg"
    }
    document.querySelector(".songname").innerHTML = name
    // document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
    // div.querySelector(".time").innerHTML = "00:00"
    // div.querySelector(".duration").innerHTML = "00:00"
}


async function DisplayAll() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".Cardcontainer")
    for (const e of anchors) {

        if (e.href.includes("songs")) {
            let folder = e.href.split("%5C").slice(-2)[1].split("/")[0]
            let response;
            try {
                let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
                response = await a.json();
            } catch (error) {
                console.warn(`No info.json file was available in ${folder}`);

            }
            cardcontainer.innerHTML += `<div data-folder="${folder}" class="card">
            <div class="playbtn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48">
                                <circle cx="12" cy="12" r="10" fill="green"></circle>
                                <path
                                    d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z"
                                    fill="black"></path>
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="Album cover">
                        <h3>${response.title}</h3>
                        <h6>${response.description}</h6>
                        </div>`
        }
    }

    Array.from(document.querySelectorAll(".card")).forEach(card => {
        card.addEventListener("click", async () => {
            let folder = card.dataset.folder;
            songs = await getsongs(`songs/${folder}`);
            playmusic(songs[0])
        })
    })
}


async function main() {
    await getsongs("songs/")
    playmusic(songs[0], true);

    await DisplayAll()

    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "images/pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "images/playnow.svg"
        }
    })

    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".time").innerHTML = `${formatTime(currentsong.currentTime)}`
        document.querySelector(".duration").innerHTML = `${formatTime(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"
    })


    document.querySelector(".seekbar").addEventListener("click", e => {
        // let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = (e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%"
        currentsong.currentTime = ((currentsong.duration) * (e.offsetX / e.target.getBoundingClientRect().width))
    })


    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    document.querySelector(".exit").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-150%"
    })
    previous.addEventListener("click", () => {
        let parts = currentsong.src.split("/");
        let currentSongName = decodeURIComponent(parts[parts.length - 1]);
        let index = songs.indexOf(currentSongName);
        if (index - 1 < 0) {
            playmusic(songs[songs.length - 1])
        } else {
            playmusic(songs[index - 1])
        }


    })
    // next.addEventListener("click", () => {
    //     let index = songs.indexOf(currentsong.src.split("/")[4].replaceAll("%20", " "))
    //     if (index + 1 < songs.length) {
    //         playmusic(songs[index + 1])
    //         console.log(index);
    // return;
    //     }

    // })
    next.addEventListener("click", () => {

        // Get the index of the current song
        let parts = currentsong.src.split("/");
        let currentSongName = decodeURIComponent(parts[parts.length - 1]);
        let index = songs.indexOf(currentSongName);

        // Check if we are at the last song
        if (index + 1 === songs.length) {
            // If yes, loop back to first song (index 0)
            playmusic(songs[0]);
        } else {
            // Otherwise, go to next song
            playmusic(songs[index + 1]);
        }
    });

    currentsong.addEventListener("ended", () => {
        let parts = currentsong.src.split("/");
        let currentSongName = decodeURIComponent(parts[parts.length - 1]);
        let index = songs.indexOf(currentSongName);
        playmusic([songs(index + 1) % songs.length])
    })

    document.addEventListener("keydown", (event) => {
        const key = event.code
        if (key === "Space") {
            event.preventDefault()
            if (currentsong.paused) {
                currentsong.play()
                play.src = "images/pause.svg"
            }
            else {
                currentsong.pause()
                play.src = "images/playnow.svg"

            }
        }
    })

    document.addEventListener("keydown", (event) => {
        const key = event.key
        if (key === "ArrowRight") {
            event.preventDefault();
            let parts = currentsong.src.split("/");
            let currentSongName = decodeURIComponent(parts[parts.length - 1]);
            let index = songs.indexOf(currentSongName);
            // if (index + 1 > songs.length - 1) {
            //     playmusic(songs[0])
            // }
            // else {
            // }
            playmusic(songs[(index + 1) % songs.length])
        }
    })

    document.addEventListener("keydown", (event) => {
        const key = event.key
        if (key === "ArrowLeft") {
            event.preventDefault();
            let parts = currentsong.src.split("/");
            let currentSongName = decodeURIComponent(parts[parts.length - 1]);
            let index = songs.indexOf(currentSongName);
            if (index - 1 >= 0) {
                playmusic(songs[index - 1])
            }
            else {
                playmusic(songs[songs.length - 1])
            }
        }
    })

    let repeatbtn = document.querySelector(".repeat")
    let isRepeat = false;
    repeatbtn.addEventListener("click", () => {
        isRepeat = !isRepeat;
        repeatbtn.classList.toggle("active", isRepeat)

        currentsong.addEventListener("ended", () => {
            if (isRepeat) {
                currentsong.currentTime = "0"
                currentsong.play();
            }
            else {
                let parts = currentsong.src.split("/");
                let currentSongName = decodeURIComponent(parts[parts.length - 1]);
                let index = songs.indexOf(currentSongName);
                if (index < songs.length - 1) {
                    playmusic(songs[index + 1])
                }
                else {
                    playmusic(songs[0])
                }
            }
        })
    })

    let Shufflebtn = document.querySelector(".shuffle")
    let isShuffle = false
    Shufflebtn.addEventListener("click", () => {
        isShuffle = !isShuffle
        Shufflebtn.classList.toggle("active", isShuffle)

    })
    currentsong.addEventListener("ended", () => {
        if (isShuffle) {
            let randomindex = Math.floor(Math.random() * songs.length)
            playmusic(songs[randomindex])
        }
        else {
            let parts = currentsong.src.split("/");
            let currentSongName = decodeURIComponent(parts[parts.length - 1]);
            let index = songs.indexOf(currentSongName);
            if (index < songs.length - 1) {
                playmusic(songs[index + 1])
            }
            else {
                playmusic(songs[0])
            }
        }
    })

    let Volume = document.querySelector(".volume")
    let Range = document.querySelector(".range")
    let Mute = false
    Volume.addEventListener("dblclick", () => {
        Mute = !Mute
        if (Mute) {
            Volume.classList.toggle("active")
            currentsong.volume = 0
            Volume.src = "images/mute.svg"
        }
        else {
            currentsong.volume = 1
            Volume.classList.remove("active")
            Volume.src = "images/volume.svg"

        }
    })
    Volume.addEventListener("click", () => {
        // if (Range.style.visibility === "hidden") {
        //     Range.style.visibility = "visible"
        // }
        // else {
        //     Range.style.visibility = "hidden"
        // }
        Range.style.visibility = Range.style.visibility === "hidden" ? "visible" : "hidden"
    })
    Range.addEventListener("input", (e) => {
        const volumevalue = parseInt(e.target.value)
        currentsong.volume = volumevalue / 100
        // if(Volume.src = "images/mute.svg"){
        //     Volume.src = "images/volume.svg"
        // }
        if (volumevalue === 0) {
            Volume.src = "images/mute.svg"
            Volume.classList.add("active", Mute)

        } else {
            Volume.src = "images/volume.svg"
            Volume.classList.remove("active", Mute)
        }
    })

    document.addEventListener("click", (e) => {
        if (!Range.contains(e.target) && !Volume.contains(e.target)) {
            Range.style.visibility = "hidden";
        }
    });

}

main()
