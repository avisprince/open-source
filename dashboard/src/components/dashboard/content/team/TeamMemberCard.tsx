import {
  Avatar,
  Button,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
} from '@fluentui/react-components';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import Flexbox from 'src/components/custom/Flexbox';
import Icon from 'src/components/custom/Icon';
import TextWithSubtext from 'src/components/custom/TextWithSubtext';
import useRemoveTeamMember from 'src/components/dashboard/content/team/hooks/useRemoveTeamMember';
import { DokkimiColorsV2 } from 'src/components/styles/colors';
import { Stylesheet } from 'src/types/Stylesheet';

import { TeamMemberCard_currUser$key } from './__generated__/TeamMemberCard_currUser.graphql';
import { TeamMemberCard_organization$key } from './__generated__/TeamMemberCard_organization.graphql';
import { TeamMemberCard_organizationMember$key } from './__generated__/TeamMemberCard_organizationMember.graphql';

type Props = {
  organizationRef: TeamMemberCard_organization$key;
  orgMemberRef: TeamMemberCard_organizationMember$key;
  currUserRef: TeamMemberCard_currUser$key;
};

export default function TeamMemberCard({
  organizationRef,
  orgMemberRef,
  currUserRef,
}: Props) {
  const [removeMember] = useRemoveTeamMember();

  const currUser = useFragment(
    graphql`
      fragment TeamMemberCard_currUser on User {
        id
        email
      }
    `,
    currUserRef,
  );

  const organization = useFragment(
    graphql`
      fragment TeamMemberCard_organization on Organization {
        owner
        members {
          email
          role
        }
      }
    `,
    organizationRef,
  );

  const { role, user } = useFragment(
    graphql`
      fragment TeamMemberCard_organizationMember on OrganizationMember {
        role
        user {
          id
          name
          email
          picture
        }
      }
    `,
    orgMemberRef,
  );

  const onRemoveMember = () => {
    removeMember(user.email);
  };

  const isOwner = user.id === organization.owner;
  const isCurrUser = user.id === currUser.id;

  const showMenu = useMemo(() => {
    if (isOwner) {
      return false;
    }

    if (isCurrUser) {
      return true;
    }

    const currUserMember = organization.members.find(
      member => member.email === currUser.email,
    );

    return currUserMember?.role !== 'user';
  }, [isOwner, isCurrUser, currUser, organization]);

  return (
    <Flexbox
      style={styles.container}
      alignItems="center"
      justifyContent="space-between"
    >
      <Flexbox alignItems="center" gap={24}>
        <Avatar size={48} image={{ src: user.picture }} />
        <TextWithSubtext text={user.name} subtext={user.email} />
      </Flexbox>
      <Flexbox alignItems="center" gap={8}>
        <div style={styles.role}>{isOwner ? 'Owner' : role}</div>
        {showMenu && (
          <Menu hasCheckmarks={false}>
            <MenuTrigger>
              <Button
                appearance="subtle"
                icon={<Icon name="threeDotsHorizontal" />}
              />
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem
                  icon={<Icon name="delete" />}
                  onClick={onRemoveMember}
                >
                  {isCurrUser
                    ? 'Leave organization'
                    : 'Remove from organization'}
                </MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
        )}
      </Flexbox>
    </Flexbox>
  );
}

const styles = {
  container: {
    padding: '12px 16px',
    borderRadius: 4,
    backgroundColor: DokkimiColorsV2.blackQuaternary,
  },
  role: {
    textTransform: 'capitalize',
  },
} satisfies Stylesheet;
