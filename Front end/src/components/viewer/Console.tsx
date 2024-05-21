import React, { useState } from 'react';
import { useEffect } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useSettings } from '../../services/useSettings';

interface ConsoleProps {
    style?: React.CSSProperties; // Define the style prop
}

export default function Console({ style }: ConsoleProps) {
    const { picked } = useSettings();

    const [value, setValue] = useState('');
    const [copied, setCopied] = useState('Copy to clipboard');

    useEffect(() => {
        if (picked) {
            setValue(picked);
        } else {
            setValue('Pick some element');
        }
    }, [picked]);

    const copyToClipboard = () => {
        if (picked) {
            navigator.clipboard.writeText(value);
            setCopied('Copied!');
        }
    };

    return (
        <div id='console' style={style}>
            <OverlayTrigger
                onExited={() => { setCopied('Copy to clipboard'); }}
                key={'copied'}
                placement={'top-end'}
                overlay={<Tooltip id={'copied'} hidden={!picked}>{copied}</Tooltip>}
            >
                <div >
                    <pre id='selected_id' onClick={copyToClipboard} style={{ fontSize: '20px', display: 'inline-block', marginLeft: '4px', color: 'black', fontWeight: 'bold' }}>{value}</pre>
                </div>
            </OverlayTrigger>
        </div>
    );
}
