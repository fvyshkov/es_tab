import React from 'react';
import { TextBox, Button as TextBoxButton } from 'devextreme-react/text-box';
import ButtonImg from '../images/icons/ref.png';

class RefTextBox extends React.Component {
    constructor(props) {
        super(props);
        this.refButton = {
          icon: ButtonImg,
          type: 'default',
          onClick: () => {
            this.onRefButtonClick(this.props.refCode, this.props.keyvalues)

          }
         };
    };


    onRefButtonClick(refcode, keyvalues) {
      this.props.onRefButtonClick(refcode, keyvalues, this.props.fieldName);
    };

    render () {
      return(
          <TextBox
            value={this.props.value}
            defaultValue={this.props.defaultValue}
            showClearButton={true}
            onValueChanged={this.props.onValueChanged}
            onFocusOut={this.props.onFocusOut}

            >
            <TextBoxButton
              name="ref"
              location="after"
              options={this.refButton}

            />
          </TextBox>
      );
    };
};

export default RefTextBox;
