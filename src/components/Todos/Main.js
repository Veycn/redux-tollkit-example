import {useDispatch, useSelector} from 'react-redux'
import {addTodo, loadTodos, selectAllTodos, deleteTodo, changeTodoState} from "../../Store/todos.slice";
import {useEffect} from "react";


function Main() {
    const dispatch = useDispatch()
    const todos = useSelector(selectAllTodos)
    useEffect(() => {
        dispatch(loadTodos())
    }, [])
    console.log(todos)
    return (
        <section className="main">
            <button onClick={() => dispatch(addTodo({id: Math.random(), title: '测试'}))}>
                添加任务
            </button>
            <ul className="todo-list">
                {
                    todos.map(todo => (
                        <li key={todo.id}>
                            <div className="view">
                                <input className="toggle" type="checkbox" value={todo.done} onChange={e => dispatch(changeTodoState({id: todo.id, changes: {done: e.target.checked}}))}/>
                                <label>{todo.title}</label>
                                <button className="destroy" onClick={() => dispatch(deleteTodo(todo.id))}/>
                            </div>
                            <input className="edit"/>
                        </li>
                    ))
                }
            </ul>
        </section>
    )
}

export default Main
