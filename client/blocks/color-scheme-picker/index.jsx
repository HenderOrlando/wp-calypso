/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'i18n-calypso';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import QueryPreferences from 'components/data/query-preferences';
import { savePreference, setPreference } from 'state/preferences/actions';
import { getPreference } from 'state/preferences/selectors';
import getColorSchemesData from './constants';
import FormRadiosBar from 'components/forms/form-radios-bar';
import {
	composeAnalytics,
	withAnalytics,
	recordTracksEvent,
	recordGoogleEvent,
	bumpStat,
} from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

class ColorSchemePicker extends PureComponent {
	static propTypes = {
		temporarySelection: PropTypes.bool,
		onSelection: PropTypes.func,
		// Connected props
		colorSchemePreference: PropTypes.string,
		saveColorSchemePreference: PropTypes.func,
	};

	handleColorSchemeSelection = event => {
		const { temporarySelection, onSelection, saveColorSchemePreference } = this.props;
		const { value } = event.currentTarget;
		if ( temporarySelection ) {
			onSelection( value );
		}
		saveColorSchemePreference( value, temporarySelection );
	};

	render() {
		const colorSchemesData = getColorSchemesData( translate );
		const checkedColorScheme = find( colorSchemesData, [
			'value',
			this.props.colorSchemePreference,
		] )
			? this.props.colorSchemePreference
			: colorSchemesData[ 0 ].value;
		return (
			<div className="color-scheme-picker">
				<QueryPreferences />
				<FormRadiosBar
					isThumbnail
					checked={ checkedColorScheme }
					onChange={ this.handleColorSchemeSelection }
					items={ colorSchemesData }
				/>
			</div>
		);
	}
}

const saveColorSchemePreference = ( preference, temporarySelection ) =>
	temporarySelection
		? withAnalytics(
				composeAnalytics(
					recordTracksEvent( 'calypso_color_theme_set', { theme: preference } ),
					recordGoogleEvent( 'Color Theme', 'Set', 'theme', preference ),
					bumpStat( 'calypso_color_scheme', 'set' )
				),
				setPreference( 'colorScheme', preference )
		  )
		: withAnalytics(
				composeAnalytics(
					recordTracksEvent( 'calypso_color_theme_saved', { theme: preference } ),
					recordGoogleEvent( 'Color Theme', 'Saved', 'theme', preference ),
					bumpStat( 'calypso_color_scheme', 'save' )
				),
				savePreference( 'colorScheme', preference )
		  );

export default connect(
	state => {
		return {
			colorSchemePreference: getPreference( state, 'colorScheme' ),
		};
	},
	{ saveColorSchemePreference }
)( ColorSchemePicker );
