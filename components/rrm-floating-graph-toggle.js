// note: it's just ref jsx at this point.

<div
    className="icon-container"
    onClick={this.fHandleLineGraphClick}
    style={{
        cursor: 'pointer',
        position: 'fixed',
        right: 5,
        top: '20%',
        width: '30px',
    }}
    title={
        this.state.bLineGraphMode ? 'Return to bar graph view of current period data.' : 'View line graph representation of data over time.'
    }
>
    {/* TODO: have iconlinegraph, iconbargraph, and iconpiegraph */}
    <IconLineGraph
        {...{
            sIconBackgroundColor: this.state.sIconBackgroundColor,
            sIconPrimaryLineColor: this.state.sIconPrimaryLineColor,
            sIconSecondaryLineColor: this.state.sIconSecondaryLineColor,
        }}
    />
</div>;
