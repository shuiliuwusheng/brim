import React from "react"
import Time, {LocalTime} from "../lib/Time"
import {shortTime} from "../timeWindowFormatter"
import * as d3 from "d3"

const FORMAT = "HH:mm"

const times = d3.timeMinute
  .every(30)
  .range(new Date(1990, 9, 16, 0, 0, 0), new Date(1990, 9, 17, 0, 0, 0))
  .map(d => LocalTime(d).format(FORMAT))

export default class TimePicker extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isOpen: false,
      value: formatTime(this.props.time)
    }
    this.onBlur = this.onBlur.bind(this)
    this.onFocus = this.onFocus.bind(this)
    this.onInputClick = this.onInputClick.bind(this)
    this.onInputChange = this.onInputChange.bind(this)
  }

  UNSAFE_componentWillReceiveProps(props) {
    this.setState({value: formatTime(props.time)})
  }

  componentDidUpdate() {
    this.scrollToSelectedTime()
  }

  onFocus() {
    this.setState({isOpen: true})
  }

  onBlur() {
    this.setState({isOpen: false})
    this.attemptCallback(this.state.value)
  }

  onTimeClick(timeString) {
    this.setState({isOpen: false})
    this.attemptCallback(timeString)
  }

  onInputClick() {
    this.setState({isOpen: true})
  }

  onInputChange(e) {
    this.setState({value: e.currentTarget.value})
  }

  scrollToSelectedTime() {
    const intervalInMinutes = 30
    const heightOfItem = 40

    const start = Time(this.props.time)
    const remainder = intervalInMinutes - (start.minute() % intervalInMinutes)
    const roundedTime = shortTime(start.add(remainder, "minutes").toDate())
    const index = times.indexOf(roundedTime) - 2

    if (this.state.isOpen && index >= 0) {
      this.timesList.scrollTop = heightOfItem * index
    }
  }

  attemptCallback(selectedValue) {
    const newTime = parseTime(selectedValue)

    if (!newTime.isValid()) {
      this.setState({value: formatTime(this.props.time)})
      return
    }

    const newValue = formatTime(newTime)
    const oldValue = formatTime(this.props.time)

    this.setState({value: newValue})

    if (newValue !== oldValue) {
      this.props.onTimeChange({
        hours: newTime.hours(),
        minutes: newTime.minutes()
      })
    }
  }

  renderTimes() {
    const timeItems = times.map(time => (
      <p key={time} onClick={() => this.onTimeClick(time)}>
        {time}
      </p>
    ))

    return (
      <div
        onMouseDown={e => e.preventDefault()}
        ref={r => (this.timesList = r)}
        className="times-list"
      >
        {timeItems}
      </div>
    )
  }

  render() {
    return (
      <div className="time-picker">
        <div className="text-input-wrapper">
          <input
            className="time-input"
            type="text"
            size="5"
            ref={r => (this.input = r)}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            value={this.state.value}
            onChange={this.onInputChange}
            onClick={this.onInputClick}
          />
        </div>
        {this.state.isOpen && this.renderTimes()}
      </div>
    )
  }
}

const formatTime = date => Time(date).format(FORMAT)
const parseTime = string => Time(string, FORMAT)
