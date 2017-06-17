import * as types from "constants/action_types";
import lbryuri from "lbryuri";

const reducers = {};
const defaultState = {};

reducers[types.RESOLVE_URI_COMPLETED] = function(state, action) {
  const { uri, certificate, claim } = action.data;

  const byUri = Object.assign({}, state.claimsByUri);
  const byId = Object.assign({}, state.byId);

  if (claim) {
    byId[claim.claim_id] = claim;
    byUri[uri] = claim.claim_id;
  } else if (claim === undefined && certificate !== undefined) {
    byId[certificate.claim_id] = certificate;
    // Don't point URI at the channel certificate unless it actually is
    // a channel URI. This is brittle.
    if (!uri.split(certificate.name)[1].match(/\//)) {
      byUri[uri] = certificate.claim_id;
    } else {
      byUri[uri] = null;
    }
  } else {
    byUri[uri] = null;
  }

  return Object.assign({}, state, {
    byId,
    claimsByUri: byUri,
  });
};

reducers[types.FETCH_CLAIM_LIST_MINE_STARTED] = function(state, action) {
  return Object.assign({}, state, {
    isClaimListMinePending: true,
  });
};

reducers[types.FETCH_CLAIM_LIST_MINE_COMPLETED] = function(state, action) {
  const { claims } = action.data;
  const myClaims = new Set(state.myClaims);
  const byUri = Object.assign({}, state.claimsByUri);
  const byId = Object.assign({}, state.byId);

  claims.forEach(claim => {
    myClaims.add(claim.claim_id);
    byId[claim.claim_id] = claim;
  });

  return Object.assign({}, state, {
    isClaimListMinePending: false,
    myClaims: myClaims,
    byId,
  });
};

reducers[types.FETCH_CHANNEL_LIST_MINE_STARTED] = function(state, action) {
  return Object.assign({}, state, { fetchingMyChannels: true });
};

reducers[types.FETCH_CHANNEL_LIST_MINE_COMPLETED] = function(state, action) {
  const { claims } = action.data;
  const myChannelClaims = new Set(state.myChannelClaims);
  const byId = Object.assign({}, state.byId);

  claims.forEach(claim => {
    myChannelClaims.add(claim.claim_id);
    byId[claims.claim_id] = claim;
  });

  return Object.assign({}, state, {
    byId,
    fetchingMyChannels: false,
    myChannelClaims,
  });
};

reducers[types.FETCH_CHANNEL_CLAIMS_COMPLETED] = function(state, action) {
  const { uri, claims } = action.data;

  const newClaims = Object.assign({}, state.claimsByChannel);

  if (claims !== undefined) {
    newClaims[uri] = claims;
  }

  return Object.assign({}, state, {
    claimsByChannel: newClaims,
  });
};

reducers[types.ABANDON_CLAIM_COMPLETED] = function(state, action) {
  const { claimId } = action.data;
  const myClaims = new Set(state.myClaims);
  const byId = Object.assign({}, state.byId);
  const claimsByUri = Object.assign({}, state.claimsByUri);
  const uris = [];

  Object.keys(claimsByUri).forEach(uri => {
    if (claimsByUri[uri] === claimId) {
      delete claimsByUri[uri];
    }
  });

  delete byId[claimId];
  myClaims.delete(claimId);

  return Object.assign({}, state, {
    myClaims,
    byId,
    claimsByUri,
  });
};

reducers[types.CREATE_CHANNEL_COMPLETED] = function(state, action) {
  const { channelClaim } = action.data;
  const byId = Object.assign({}, state.byId);
  const myChannelClaims = new Set(state.myChannelClaims);

  byId[channelClaim.claim_id] = channelClaim;
  myChannelClaims.add(channelClaim.claim_id);

  return Object.assign({}, state, {
    byId,
    myChannelClaims,
  });
};

reducers[types.PUBLISH_COMPLETED] = function(state, action) {
  const { claim } = action.data;
  const byId = Object.assign({}, state.byId);
  const myClaims = new Set(state.myClaims);

  byId[claim.claim_id] = claim;
  myClaims.add(claim.claim_id);

  return Object.assign({}, state, {
    byId,
    myClaims,
  });
};

export default function reducer(state = defaultState, action) {
  const handler = reducers[action.type];
  if (handler) return handler(state, action);
  return state;
}
