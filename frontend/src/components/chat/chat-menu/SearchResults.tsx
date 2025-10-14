import React from 'react'
import type {UserItem} from '../../../types/chat';
import {UserListItem} from './UserListItem';
import {List, ListItem, ListItemText} from '@mui/material';
import {listStyles} from '../../../styles/chatLists';

export interface SearchResultsProps {
    searchResults: UserItem[];
    isSearching: boolean;
    onUserSelect: (user: UserItem) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
                                                                isSearching,
                                                                searchResults,
                                                                onUserSelect,
                                                            }) => {
    return (
        <List sx={listStyles}>
            {searchResults.length > 0 ? (
                searchResults.map((user) => (
                    <UserListItem
                        key={user.id}
                        user={user}
                        onSelect={onUserSelect}
                    />
                ))
            ) : (
                <ListItem>
                    <ListItemText
                        primary={isSearching ? "Searching..." : "No users found"}
                        sx={{textAlign: 'center', color: 'text.secondary'}}
                    />
                </ListItem>
            )}
        </List>
    );
};