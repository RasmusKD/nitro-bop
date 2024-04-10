import { Dispatch, FC, SetStateAction, useEffect, useMemo, useState } from 'react';
import { Base, Grid, Flex, NitroCardView, NitroCardHeaderView, NitroCardTabsView, NitroCardTabsItemView, NitroCardContentView, Text, LayoutCurrencyIcon } from '../../common';
import { useRoom } from '../../hooks';
import { HabboClubLevelEnum, ILinkEventTracker } from '@nitrots/nitro-renderer';
import { AddEventLinkTracker, GetClubMemberLevel, GetConfiguration, GetSessionDataManager, RemoveLinkEventTracker } from '../../api';

interface BackgroundsViewProps {
    setIsVisible: Dispatch<SetStateAction<boolean>>;
    selectedBackground: number;
    setSelectedBackground: Dispatch<SetStateAction<number>>;
    selectedStand: number;
    setSelectedStand: Dispatch<SetStateAction<number>>;
    selectedOverlay: number;
    setSelectedOverlay: Dispatch<SetStateAction<number>>;
}

export const BackgroundsView: FC<BackgroundsViewProps> = ({ setIsVisible, selectedBackground, setSelectedBackground, selectedStand, setSelectedStand, selectedOverlay, setSelectedOverlay }) =>
{
    const [ activeTab, setActiveTab ] = useState('backgrounds');
    const { roomSession = null } = useRoom();
    const isHcMember = GetClubMemberLevel() >= HabboClubLevelEnum.CLUB;
    const userSecurityLevel = GetSessionDataManager().canChangeName;
    const processData = (configData: any[], dataType: string) =>
    {
        return configData.filter(item =>
        {
            const hasRequiredSecurityLevel = userSecurityLevel >= item.minRank;
            const isEligibleForAmbassador = !item.isAmbassadorOnly || GetSessionDataManager().isAmbassador;
            return item.isHcOnly || (hasRequiredSecurityLevel && isEligibleForAmbassador);
        }).map(item => ({
            id: item[dataType + 'Id'],
            ...item,
            selectable: (!item.isHcOnly || isHcMember)
        }));
    };

    const backgroundsData = useMemo(() => processData(GetConfiguration('backgrounds.data'), 'background'), [ userSecurityLevel, isHcMember ]);
    const standsData = useMemo(() => processData(GetConfiguration('stands.data'), 'stand'), [ userSecurityLevel, isHcMember ]);
    const overlaysData = useMemo(() => processData(GetConfiguration('overlays.data'), 'overlay'), [ userSecurityLevel, isHcMember ]);

    const handleTabClick = (tabName: SetStateAction<string>) =>
    {
        setActiveTab(tabName);
    };

    const handleSelection = (id) =>
    {
        switch (activeTab)
        {
            case 'backgrounds':
                setSelectedBackground(id);
                sendSelections(id, selectedStand, selectedOverlay);
                break;
            case 'stands':
                setSelectedStand(id);
                sendSelections(selectedBackground, id, selectedOverlay);
                break;
            case 'overlays':
                setSelectedOverlay(id);
                sendSelections(selectedBackground, selectedStand, id);
                break;
            default:
                break;
        }
    };

    const sendSelections = (background: number, stand: number, overlay: number) =>
    {
        roomSession.sendBackgroundMessage(background, stand, overlay);
    };

    return (
        <NitroCardView uniqueKey="backgrounds" className="nitro-backgrounds no-resize" theme="primary">
            <NitroCardHeaderView headerText={ 'Profil Baggrund' } onCloseClick={ () => setIsVisible(false) } />
            <NitroCardTabsView>
                <NitroCardTabsItemView isActive={ activeTab === 'backgrounds' } onClick={ () => handleTabClick('backgrounds') }>
                    Backgrounds
                </NitroCardTabsItemView>
                <NitroCardTabsItemView isActive={ activeTab === 'stands' } onClick={ () => handleTabClick('stands') }>
                    Stands
                </NitroCardTabsItemView>
                <NitroCardTabsItemView isActive={ activeTab === 'overlays' } onClick={ () => handleTabClick('overlays') }>
                    Overlays
                </NitroCardTabsItemView>
            </NitroCardTabsView>
            <NitroCardContentView gap={ 1 }>
                <Text bold center>Select an Option</Text>
                <Grid gap={ 1 } columnCount={ 7 } overflow="auto">
                    { activeTab === 'backgrounds' && backgroundsData.map(item => (
                        <Flex
                            pointer
                            position="relative"
                            key={ item.id }
                            onClick={ () => item.selectable && handleSelection(item.id) }
                            className={ item.selectable ? '' : 'non-selectable' }>
                            <Base className={ `profile-background background-${ item.id }` } />
                            { item.isHcOnly && <LayoutCurrencyIcon position="absolute" className="top-1 end-1" type="hc" /> }
                        </Flex>
                    )) }
                    { activeTab === 'stands' && standsData.map(item => (
                        <Flex
                            pointer
                            position="relative"
                            key={ item.id }
                            onClick={ () => item.selectable && handleSelection(item.id) }
                            className={ item.selectable ? '' : 'non-selectable' }
                        >
                            <Base className={ `profile-stand stand-${ item.id }` } />
                            { item.isHcOnly && <LayoutCurrencyIcon position="absolute" className="top-1 end-1" type="hc" /> }
                        </Flex>
                    )) }
                    { activeTab === 'overlays' && overlaysData.map(item => (
                        <Flex
                            pointer
                            position="relative"
                            key={ item.id }
                            onClick={ () => item.selectable && handleSelection(item.id) }
                            className={ item.selectable ? '' : 'non-selectable' }
                        >
                            <Base className={ `profile-overlay overlay-${ item.id }` } />
                            { item.isHcOnly && <LayoutCurrencyIcon position="absolute" className="top-1 end-1" type="hc" /> }
                        </Flex>
                    )) }
                </Grid>
            </NitroCardContentView>
        </NitroCardView>
    );
};