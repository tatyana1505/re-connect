import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Thumbnail, Icon } from 'native-base';
import Avatar from '../../../components/Avatar';
import commonColor from '../../../native-base-theme/variables/commonColor';

const constants = {
  userBox: {
    boxHeight: 115 + commonColor.lineHeight,
    boxWidth: 80,
    boxTopLineHeight: 30,
    boxBottomLineHeight: 30,
    boxHorizontalMargin: 30,
  }
}

const UserNode = (props) => {

  const { user, onNewMemberClick, isRootNode = false, isPartnerOnLeft,
    isAddingMode, isDeletingMode, onMemberDelete, isBordering,
    navigation, parents = [], siblings = [], family } = props;

  const partnersLength = user.partners ? user.partners.length : 0;

  return (
    <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
      <View
        style={{
          width: constants.userBox.boxWidth * (1 + partnersLength) + 50 * Math.max(1, partnersLength),
          height: constants.userBox.boxHeight - (user.children && user.children.length === 1 ? 30 : 0),
          alignItems: 'flex-start',
          justifyContent: 'center',
          flexDirection: 'row',
        }}
      >
        {!isPartnerOnLeft && <UserItem {...props} user={{ ...user, parents, siblings }} />}
        {user.partners && user.partners.map((partner, index) => (
          <UserItem
            user={{ ...partner, children: [...user.children], partners: [user] }}
            onNewMemberClick={onNewMemberClick}
            key={index}
            isPartner
            isSingleSiblingPartner={!(user.siblings && user.siblings.length > 0)}
            isAddingMode={isAddingMode}
            isDeletingMode={isDeletingMode}
            onMemberDelete={onMemberDelete}
            index={index}
            isBordering={isBordering}
            isPartnerOnLeft={isPartnerOnLeft}
            navigation={navigation}
            isRootNodePartner={isRootNode}
            family={family}
          />
        ))}
        {isPartnerOnLeft && <UserItem {...props} user={{ ...user, parents, siblings }} />}
      </View>

      {/* Vertical Line below each node, only if greater than 1 children */}
      {user.children && user.children.length > 1 &&
        <View style={{ width: 2, height: 30, backgroundColor: '#333', marginTop: 5 }} />
      }

      <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row' }}>
          {user.children.map((child, index) => {
            const isBordering = index === 0 || index + 1 === user.children.length;
            return (
              // Horizontal Line below each node
              <View key={index}>
                {isBordering && user.children.length > 1 &&
                  <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 1, height: 2, backgroundColor: index === 0 ? 'transparent' : '#333' }} />
                    <View style={{ flex: 1, height: 2, backgroundColor: index === 0 ? '#333' : 'transparent' }} />
                  </View>
                }
                {!isBordering && user.children.length > 1 &&
                  <View style={{ height: 2, backgroundColor: '#333' }} />
                }
                <UserNode
                  user={child}
                  onNewMemberClick={onNewMemberClick}
                  isPartnerOnLeft={index + 1 >= user.children.length}
                  isAddingMode={isAddingMode}
                  isDeletingMode={isDeletingMode}
                  onMemberDelete={onMemberDelete}
                  isBordering={isBordering}
                  navigation={navigation}
                  parents={[user, ...user.partners]}
                  siblings={[...(user.children.filter(sibling => sibling.email !== child.email))]}
                  family={family}
                />
              </View>
            )
          })}
        </View>
      </View>
    </View>
  );
}

export default UserNode;

const UserItem = (props) => {

  const { user, onNewMemberClick, isRootNode = false, isPartner = false, isRootNodePartner = false, isAddingMode,
    isDeletingMode, onMemberDelete, isBordering, isPartnerOnLeft, navigation, family, isSingleSiblingPartner = false } = props;

  const showOverlay = (isAddingMode && !isPartner) || (isDeletingMode && !isRootNode);
  const overlayIcon = isAddingMode ? "add" : "remove";

  return (

    <View style={{ alignItems: 'center', justifyContent: 'space-between', width: constants.userBox.boxWidth }}>

      {/* Horizontal Line on top of bordering non partner users */}
      {isBordering && user.partners && user.partners.length > 0 && user.siblings && user.siblings > 0 &&
        <View style={{ flexDirection: 'row', position: 'relative', top: -2 }}>
          <View style={[styles.horizontalLineFlexed, { backgroundColor: isPartnerOnLeft ? '#333' : 'transparent' }]} />
          <View style={[styles.horizontalLineFlexed, { backgroundColor: isPartnerOnLeft ? 'transparent' : '#333' }]} />
        </View>
      }

      {/* Horizontal Line on top of all partners */}
      {isPartner && !isRootNodePartner && !isSingleSiblingPartner &&
        <View style={{ flexDirection: 'row', position: 'relative', top: isBordering ? -4 : -2 }}>
          <View style={{ flex: 1, height: 2, backgroundColor: '#333' }} />
        </View>
      }

      {/* Vertical Line on top of node */}
      {
        !isRootNode && !isRootNodePartner &&
        <View
          style={{
            position: 'relative',
            top: isBordering && user.partners && user.partners.length > 0 ? -4 : -2,
            width: 2,
            height: 30,
            marginBottom: 10,
            backgroundColor: isPartner ? 'transparent' : '#333',
          }}
        />
      }

      <View>
        <TouchableOpacity onPress={() => navigation.push('FamilyProfile', { user, family })}>
          <Avatar size={60} name={displayName(user)} photo={user.data.photo} />
        </TouchableOpacity>
        {showOverlay &&
          <TouchableOpacity style={styles.addOverlay} onPress={() => isAddingMode ? onNewMemberClick(user.email) : onMemberDelete(user.email)}>
            <Icon name={overlayIcon} style={{ color: 'white' }} size={36} />
          </TouchableOpacity>
        }
      </View>
      <Text numberOfLines={2} style={{ textAlign: 'center' }}>{displayName(user)}</Text>
    </View >

  )
}

function displayName(user) {
  return user.data ? (user.data.displayName || user.displayName || user.email) : user.displayName || user.email || "No Name";
}

const styles = StyleSheet.create({
  addOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 60,
    width: 60,
    backgroundColor: '#0006',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalLineFlexed: {
    height: 2,
    flex: 1,
  },
  horizontalLine: {
    height: 2,
  },
  borderBgColor: {
    backgroundColor: '#333',
  }
})