import {useRef, useEffect, useState} from 'react'
import Trash from '../icons/Trash';
import { db } from '../appwrite/databases.js';
import Spinner from '../icons/Spinner.jsx';
import { setNewOffset, autoGrow, setZIndex, bodyParser } from '../utils.js';

const NoteCard = ({note}) => {
    const [saving, setSaving] = useState(false);
    const keyUpTimer = useRef(null);

    const body = bodyParser(note.body);
    const [position, setPosition] = useState(JSON.parse(note.position));
    const colors = JSON.parse(note.colors);

    let mouseStartPos = { x: 0, y: 0 };
    const cardRef = useRef(null);
    

    const textAreaRef = useRef(null);

    useEffect(() => {
        autoGrow(textAreaRef);
    }, []);

    const mouseDown = (e) => {
      setZIndex(cardRef.current);
      mouseStartPos.x = e.clientX;
      mouseStartPos.y = e.clientY;

      document.addEventListener('mousemove', mouseMove);
      document.addEventListener('mouseup', mouseUp);
    }

    const mouseMove = (e) => {
      let mouseMoveDir = {
        x: mouseStartPos.x - e.clientX,
        y: mouseStartPos.y - e.clientY,
      };

      mouseStartPos.x = e.clientX;
      mouseStartPos.y = e.clientY;

      const newPosition = setNewOffset(cardRef.current, mouseMoveDir);
      setPosition(newPosition);

    };

    const mouseUp = () => {
      document.removeEventListener('mousemove', mouseMove);
      document.removeEventListener('mouseup', mouseUp);

      const newPosition = setNewOffset(cardRef.current);
      saveData('position', newPosition);
    }

    const saveData = async (key, value) => {
      const payload = {[key]: JSON.stringify(value)};

      try{
        await db.notes.update(note.$id, payload);
      }catch(error){
        console.log(error);
      }
      setSaving(false);
    };

    const handleKeyUp = () => {
      setSaving(true);

      if(keyUpTimer.current){
        clearTimeout(keyUpTimer.current);
      }

      keyUpTimer.current = setTimeout(() => {
        saveData("body", textAreaRef.current.value);
      }, 2000);
    };


    return (
    <div 
    ref={cardRef} 
    className='card' 
    style={{
      backgroundColor: colors.colorBody,
      left: `${position.x}px`,
      top: `${position.y}px`,
      }}>

      <div
      onMouseDown={ mouseDown }
      className='card-header' 
      style={{backgroundColor: colors.colorHeader}}>
      <Trash />
      {saving && (
        <div className="card-saving">
          <Spinner color={colors.colorText} />
            <span style={{ color: colors.colorText }}>Saving...</span>
        </div>
    )}
      </div>

        <div className='card-body'>
          <textarea
          onKeyUp={handleKeyUp} 
          ref={textAreaRef}
          style={{color: colors.colorText }} defaultValue = {body}
          onInput={() => {autoGrow(textAreaRef)}}
          onFocus={() => setZIndex(cardRef.current)}
          >
          </textarea>
        </div>
    </div>
  )
}

export default NoteCard
