import "./Sidebar.css";
import { useContext, useEffect } from "react";
import  { MyContext }  from "./MyContext.jsx";
import {v1 as uuidv1} from "uuid";

function Sidebar() {
    const {allThreads, setAllThreads, currThreadId, setNewChat, setPrompt, setReply, setCurrThreadId, setPrevChats} = useContext(MyContext);
    const getAllThreads = async() => {
        try {
           const response = await fetch("http://localhost:8000/api/thread");
           const res = await response.json();
           const filteredData = res.map(thread => ({threadId: thread.threadId, title: thread.title}));
            //console.log(filteredData);
            setAllThreads(filteredData);
        //    console.log(res);
           //threadId, title
        } catch(err){
            console.log(err);
        }
    };
    useEffect(() => {
      getAllThreads();
    }, [currThreadId])

        const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
    }

    const changeThread = async (newThreadId) => {
           setCurrThreadId(newThreadId);
           try {
              const response = await fetch(`http://localhost:8000/api/thread/${newThreadId}`);
              const res = await response.json();
              console.log(res);
              setPrevChats(res);
              setNewChat(false);
              setReply(null);
           }catch(err){
            console.log(err);
           }
    };

    const deleteThread = async (threadId) => {
        try {
            const response = await fetch(`http://localhost:8000/api/thread/${threadId}`, {
                method: "DELETE"
            });
            const res = await response.json();
            if (response.ok) {
                setAllThreads(prev => prev.filter(t => t.threadId !== threadId));
                if (currThreadId === threadId) {
                    createNewChat();
                }
            }
        } catch(err) {
            console.log(err);
        }
    };

    return (
        <section className="sidebar">
            <button onClick={createNewChat}>
                <img src="/NexaAI1.png" alt="Nexa logo" className="logo"></img>
                <span><i className="fa-solid fa-pen-to-square"></i></span>
            </button>
            {/* history */}
            <ul className="history">
                     {
                        allThreads?.map((thread, idx) => (
                        <li key={idx} 
                            onClick={(e) => changeThread(thread.threadId)}
                            className={thread.threadId === currThreadId ? "highlighted": ""}
                        >
                            {thread.title}
                            <i className="fa-solid fa-trash"
                                onClick={(e) => {
                                    e.stopPropagation(); //stop event bubbling
                                    deleteThread(thread.threadId);
                                }}
                            ></i>
                        </li>
                    ))
                     }       
            </ul>
             {/* sign */}
             <div className="sign">
                <p>By DurgeshNandan &hearts;</p>
             </div>
        </section>
    )
}

export default Sidebar;