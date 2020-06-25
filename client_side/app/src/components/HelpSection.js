import React from 'react';
import HelpIcon from '@material-ui/icons/Help';


class HelpSection extends React.Component {
    render() {
        return <div className="help-icon-div">
                <HelpIcon color="inherit" fontSize="inherit" onClick={() => alert('Help!')}></HelpIcon>
            </div>;
    }
}

export default HelpSection;