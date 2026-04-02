export const isElectionLocked = (year) => {
    return localStorage.getItem(`votingStatus_${year}`) === 'open';
}