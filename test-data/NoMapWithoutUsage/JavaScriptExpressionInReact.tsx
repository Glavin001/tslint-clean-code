import React = require('react');

export class MyComponent extends React.Component<{}, {}> {
    public render() {
        const arr = [1, 2, 3];
        return (
            <ul>
                {arr.map(curr => (
                    <li>{curr}</li>
                ))}
            </ul>
        );
    }
}
