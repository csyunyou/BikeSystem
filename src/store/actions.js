'use strict';
export const getAllStations = ({ commit },layerControl) => {
	commit('GET_ALL_STATIONS',layerControl);
};
export const getSelectedStations = ({commit },polygon) => {
	commit('GET_SELECTED_STATIONS',polygon);
};
export const filterStations = ({state,commit },cluster) => {
	state.selectedCluster=cluster;
	commit('FILTER_STATIONS',cluster);
};
export const drawStations = ({ commit }) => {
	commit('DRAW_STATIONS');
};
export const getCentroids = ({ commit },map) => {
	commit('GET_CENTROIDS',map);
};
