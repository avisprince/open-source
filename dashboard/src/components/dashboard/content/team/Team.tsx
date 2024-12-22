import { Button, Input } from '@fluentui/react-components';
import { useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import validator from 'validator';

import Flexbox from 'src/components/custom/Flexbox';
import TeamMemberCard from 'src/components/dashboard/content/team/TeamMemberCard';
import useAddTeamMember from 'src/components/dashboard/content/team/hooks/useAddTeamMember';
import ContentLayout from 'src/components/dashboard/layout/content/ContentLayout';
import { Stylesheet } from 'src/types/Stylesheet';

import { Team_currentUser$key } from './__generated__/Team_currentUser.graphql';
import { Team_organization$key } from './__generated__/Team_organization.graphql';

type Props = {
  currentUserRef: Team_currentUser$key;
  organizationRef: Team_organization$key | null;
};

export default function Team({ currentUserRef, organizationRef }: Props) {
  const [inviteInput, setInviteInput] = useState('');
  const [addMember] = useAddTeamMember();

  const currUser = useFragment(
    graphql`
      fragment Team_currentUser on User {
        ...TeamMemberCard_currUser
      }
    `,
    currentUserRef,
  );

  const organization = useFragment(
    graphql`
      fragment Team_organization on Organization {
        ...TeamMemberCard_organization
        members {
          email
          ...TeamMemberCard_organizationMember
        }
      }
    `,
    organizationRef,
  );

  const addButtonEnabled = useMemo(() => {
    return validator.isEmail(inviteInput);
  }, [inviteInput]);

  const onAddClick = () => {
    addMember(inviteInput);
    setInviteInput('');
  };

  return (
    <ContentLayout title="Team Members">
      <Flexbox direction="column" gap={32} style={styles.container}>
        <Flexbox direction="column" gap={8}>
          <div>Add Team Member</div>
          <Flexbox alignItems="center" gap={8}>
            <Input
              value={inviteInput}
              onChange={e => setInviteInput(e.target.value)}
              placeholder="Enter email address"
              style={styles.emailInput}
            />
            <Button
              appearance="primary"
              onClick={onAddClick}
              disabled={!addButtonEnabled}
            >
              Add
            </Button>
          </Flexbox>
        </Flexbox>
        <Flexbox direction="column" gap={16} style={styles.members}>
          {organization?.members.map(member => {
            return (
              <TeamMemberCard
                key={member.email}
                currUserRef={currUser}
                organizationRef={organization}
                orgMemberRef={member}
              />
            );
          })}
        </Flexbox>
      </Flexbox>
    </ContentLayout>
  );
}

const styles = {
  container: {
    overflow: 'hidden',
  },
  emailInput: {
    width: '50%',
  },
  members: {
    flexGrow: 1,
    overflowY: 'auto',
  },
} satisfies Stylesheet;
