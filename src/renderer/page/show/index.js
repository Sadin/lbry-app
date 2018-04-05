import { connect } from 'react-redux';
import { doResolveUri, makeSelectClaimForUri, makeSelectIsUriResolving } from 'lbry-redux';
import ShowPage from './view';

const select = (state, props) => ({
  claim: makeSelectClaimForUri(props.uri)(state),
  isResolvingUri: makeSelectIsUriResolving(props.uri)(state),
});

const perform = dispatch => ({
  resolveUri: uri => dispatch(doResolveUri(uri)),
});

export default connect(select, perform)(ShowPage);
