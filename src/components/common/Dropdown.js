import React, { Component } from "react";
import { Dropdown as SemanticDropdown } from "semantic-ui-react";

const options = [
  { key: 1, text: "Article", value: "article" },
  { key: 2, text: "Book", value: "book" },
  { key: 3, text: "Video", value: "video" },
  { key: 4, text: "Research", value: "research" },
  { key: 5, text: "Webpage", value: "webpage" }
];

class Dropdown extends Component {
  render() {
    const { options, value, placeholder } = this.props;
    return (
      <SemanticDropdown
        closeOnChange
        onChange={this.onChange}
        options={options}
        placeholder={placeholder}
        value={value ? value : ""}
        clearable
        fluid
        selection
        compact
        selectOnNavigation={false}
        selectOnBlur={false}
      />
    );
  }
}

export default Dropdown;
