import React, { useState } from 'react'
import { Users, Plus, Link as LinkIcon, Copy, Check, X } from 'lucide-react'
import { useStore } from '../store'
import { getTranslation } from '../i18n/translations'
import './GroupManager.css'

function GroupManager() {
  const language = useStore((state) => state.language || 'en')
  const [isOpen, setIsOpen] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [groups, setGroups] = useState([])
  const [copiedLink, setCopiedLink] = useState(null)

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      alert(getTranslation('groupNameRequired', language) || 'Group name is required')
      return
    }

    const groupId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const groupLink = `${window.location.origin}${window.location.pathname}#group/${groupId}`
    
    const newGroup = {
      id: groupId,
      name: groupName,
      link: groupLink,
      createdAt: new Date().toISOString(),
      members: 1
    }

    setGroups([...groups, newGroup])
    localStorage.setItem('groups', JSON.stringify([...groups, newGroup]))
    setGroupName('')
    setShowCreateForm(false)
    
    // Copy link to clipboard
    navigator.clipboard.writeText(groupLink)
    setCopiedLink(groupId)
    setTimeout(() => setCopiedLink(null), 2000)
  }

  const handleCopyLink = (groupId) => {
    const group = groups.find(g => g.id === groupId)
    if (group) {
      navigator.clipboard.writeText(group.link)
      setCopiedLink(groupId)
      setTimeout(() => setCopiedLink(null), 2000)
    }
  }

  React.useEffect(() => {
    const savedGroups = localStorage.getItem('groups')
    if (savedGroups) {
      setGroups(JSON.parse(savedGroups))
    }
  }, [])

  return (
    <>
      <button
        className="group-manager-btn"
        onClick={() => setIsOpen(true)}
      >
        <Users size={18} />
        <span>{getTranslation('groups', language) || 'Groups'}</span>
      </button>

      {isOpen && (
        <>
          <div className="group-overlay" onClick={() => setIsOpen(false)} />
          <div className="group-panel">
            <div className="group-panel-header">
              <h2>{getTranslation('groupWorkspaces', language) || 'Group Workspaces'}</h2>
              <button className="close-group-panel" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <button
              className="create-group-btn"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus size={18} />
              {getTranslation('createGroup', language) || 'Create New Group'}
            </button>

            {showCreateForm && (
              <div className="create-group-form">
                <input
                  type="text"
                  placeholder={getTranslation('groupName', language) || 'Group Name'}
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="group-input"
                />
                <div className="form-actions">
                  <button onClick={handleCreateGroup} className="save-btn">
                    {getTranslation('create', language)}
                  </button>
                  <button onClick={() => setShowCreateForm(false)} className="cancel-btn">
                    {getTranslation('cancel', language)}
                  </button>
                </div>
              </div>
            )}

            <div className="groups-list">
              {groups.map((group) => (
                <div key={group.id} className="group-item">
                  <div className="group-info">
                    <h3>{group.name}</h3>
                    <p className="group-meta">
                      {getTranslation('members', language) || 'Members'}: {group.members}
                    </p>
                  </div>
                  <div className="group-actions">
                    <button
                      className="copy-link-btn"
                      onClick={() => handleCopyLink(group.id)}
                    >
                      {copiedLink === group.id ? (
                        <Check size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                    <a
                      href={group.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="open-link-btn"
                    >
                      <LinkIcon size={16} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default GroupManager

