import { useState } from 'react'
import './App.css'

function App() {
  // All state variables used to make the calendar and welcome page work. Dang a lot of them :(
  const [showWelcome, setShowWelcome] = useState(true) // Used to show the welcome page
  const [currentDate, setCurrentDate] = useState(new Date()) // Used to set the current date to display the calendar for the user
  const [selectedDate, setSelectedDate] = useState(null) // Used to set the selected date to add a note to
  const [showPopout, setShowPopout] = useState(false) //popout the note text box!
  const [noteText, setNoteText] = useState('') // sets the text inside the note text box
  const [notes, setNotes] = useState({}) // sets the notes for the current date
  const [expandedDay, setExpandedDay] = useState(null) // sets the expanded day to display the notes for the selected day
  

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ] // have all the days and months of a year !!!!

  // Get days in current month
  const getDaysInMonth = (date) => {
    // To find the last day of the month, such as January 31st, 
    // we get February and use day 0 to get the last day of January to account for leap years!
    // getDate returns the day number!!
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  // Get first day of month (0-6) sicne it starts from 0 for sunday and goes up to 6 for saturday
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }
  // these two functions are from https://stackoverflow.com/questions/13571700/get-first-and-last-date-of-current-month-with-javascript-or-jquery

  // Navigation 
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  } // changing the month to the prev or next duh

  // Month/Year selector choose years from 1964 to 2100 so :/ gotta give room for the immortals
  const handleMonthYearSelect = (event) => {
    const [year, month] = event.target.value.split('-')
    setCurrentDate(new Date(parseInt(year), parseInt(month)))
  }

  // Note handling
  const handleAddNote = (day) => {
    setSelectedDate(day)
    setShowPopout(true) //popout the note to add any messages and note for the user
  }

  const handleSaveNote = () => {
    if (noteText.trim()) {
      const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${selectedDate}`
      const existingNotes = notes[dateKey] || []
      setNotes({
        ...notes,
        [dateKey]: [...existingNotes, noteText]
      })
      setNoteText('')
    }
    setShowPopout(false)
  }

  // Add delete note functionality
  const handleDeleteNote = (dateKey, noteIndex, event) => {
    event.stopPropagation();
    setNotes(prevNotes => {
      const updatedNotes = [...(prevNotes[dateKey] || [])];
      updatedNotes.splice(noteIndex, 1);
      return {
        ...prevNotes,
        [dateKey]: updatedNotes
      };
    });
  };

  // Generate the calendar   
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Add weekdays
    weekdays.forEach(day => {
      days.push(
        <div key={`header-${day}`} className="weekday-header">
          {day}
        </div>
      )
    })

    // Add empty cells for days before the first day so they cant add any notes to them :/ duh
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`
      const dayNotes = notes[dateKey] || []
      
      days.push(
        <div 
          key={`day-${day}`} 
          className="calendar-day"
        >
          <div 
            className="date-header"
            onClick={() => setExpandedDay(day)}
          >
            <span>{day}</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleAddNote(day);
              }} 
              className="add-note-btn"
            >
              +
            </button>
          </div>
          <div className="notes-container">
            {dayNotes.map((note, index) => (
              <div key={index} className="note">
                <div className="note-content">{note}</div>
                <button 
                  className="delete-note"
                  onClick={(e) => handleDeleteNote(dateKey, index, e)}
                  title="Delete note"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return days
  }

  const renderExpandedDay = () => {
    if (!expandedDay) return null;

    const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${expandedDay}`;
    const dayNotes = notes[dateKey] || [];

    return (
      <>
        <div className="calendar-overlay" onClick={() => setExpandedDay(null)} />
        <div className="expanded-day-overlay">
          <div className="expanded-day-header">
            <h2>{months[currentDate.getMonth()]} {expandedDay}, {currentDate.getFullYear()}</h2>
            <button 
              className="expanded-day-close"
              onClick={() => setExpandedDay(null)}
            >
              x
            </button>
          </div>
          <div className="expanded-day-notes">
            {dayNotes.map((note, index) => (
              <div key={index} className="note">
                <div className="note-content">{note}</div>
                <button 
                  className="delete-note"
                  onClick={(e) => handleDeleteNote(dateKey, index, e)}
                  title="Delete note"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  // Generate month and the year
  const generateMonthYearOptions = () => {
    const options = []
    const currentYear = new Date().getFullYear()
    
    for (let year = currentYear - 100; year <= currentYear + 100; year++) {
      for (let month = 0; month < 12; month++) {
        options.push(
          <option key={`${year}-${month}`} value={`${year}-${month}`}>
            {months[month]} {year}
          </option>
        )
      }
    }
    return options
  }
  // to close the start screen
  const handleStartCalendar = () => {
    setShowWelcome(false)
  }
  // start screen with cloud animations heh
  if (showWelcome) {
    return (
      <div className="welcome-page">
        <div className="clouds">
          <div className="cloud cloud1"></div>
          <div className="cloud cloud2"></div>
          <div className="cloud cloud3"></div>
          <div className="cloud cloud4"></div>
        </div>
        <div className="welcome-content">
          <h1>Welcome to Calendar Planner</h1>
          <p>Add notes and happy events you experienced</p>
          <button onClick={handleStartCalendar} className="start-button">
            Get Started!
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="calendar-app">
      <div className="calendar-header">
        <button onClick={handlePrevMonth}>&lt;</button>
        <select 
          value={`${currentDate.getFullYear()}-${currentDate.getMonth()}`} // gets the current date and makes the selection scroll
          onChange={handleMonthYearSelect}
          className="month-year-select"
        >
          {generateMonthYearOptions()}
        </select>
        <button onClick={handleNextMonth}>&gt;</button>
      </div>

      <div className="calendar-grid">
        {renderCalendar()}
      </div>

      {renderExpandedDay()}

      {showPopout && (
        <div className="popout-overlay">
          <div className="popout">
            <h3>Add Note for {months[currentDate.getMonth()]} {selectedDate}</h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Enter your note..."
            />
            <div className="popout-buttons">
              <button onClick={() => setShowPopout(false)}>Cancel</button>
              <button onClick={handleSaveNote}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App