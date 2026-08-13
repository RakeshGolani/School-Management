import { Document, Page, View, Text, Image, StyleSheet, Font, Svg, Path } from '@react-pdf/renderer';
import { hexToRgba } from '@/lib/themeHelper';

const GraduationCapIcon = ({ color }) => (
  <Svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M22 10v6M2 10l10-5 10 5-10 5z" fill="none" stroke={color} />
    <Path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" fill="none" stroke={color} />
  </Svg>
);

const CheckCircleIcon = ({ color }) => (
  <Svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" fill="none" stroke={color} />
    <Path d="M22 4L12 14.01l-3-3" fill="none" stroke={color} />
  </Svg>
);

// Let's use the core PDF built-in fonts (Helvetica / Helvetica-Bold) to avoid fetching over network and CDN errors.

const styles = StyleSheet.create({
  page: {
    width: '153pt',
    height: '244pt',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 0,
    margin: 0
  },
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    paddingVertical: 6,
    paddingHorizontal: 8,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  schoolLogo: {
    width: 28,
    height: 28,
    borderRadius: 4
  },
  headerTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
    minWidth: 0
  },
  schoolName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: '#0f172a',
    textTransform: 'uppercase',
    textAlign: 'left'
  },
  headerSub: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 5,
    color: '#059669',
    textTransform: 'uppercase',
    marginTop: 1,
    letterSpacing: 0.5,
    textAlign: 'left'
  },
  content: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'flex-start',
    fontFamily: 'Helvetica'
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#ffffff',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    marginTop: 2
  },
  avatar: {
    width: '100%',
    height: '100%'
  },
  avatarText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 20,
    color: '#059669'
  },
  name: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: '#0f172a',
    textAlign: 'center',
    marginTop: 2
  },
  className: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 6,
    color: '#059669',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 2,
    textAlign: 'center'
  },
  detailsGrid: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    padding: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginTop: 6,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  detailItem: {
    width: '50%',
    marginBottom: 3,
    paddingHorizontal: 2
  },
  detailLabel: {
    fontSize: 5,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontFamily: 'Helvetica-Bold'
  },
  detailValue: {
    fontSize: 6,
    color: '#334155',
    fontFamily: 'Helvetica-Bold',
    marginTop: 0.5
  },
  infoSection: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 4,
    marginTop: 4
  },
  teacherRow: {
    backgroundColor: '#f0fdf4',
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 4,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2
  },
  infoTextBold: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 6,
    color: '#0f172a'
  },
  infoTextGreen: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 6,
    color: '#059669'
  },
  infoRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginVertical: 0.5
  },
  infoLabel: {
    fontSize: 6,
    color: '#64748b'
  },
  infoValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 6,
    color: '#0f172a'
  },
  footer: {
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  footerText: {
    fontSize: 5,
    color: '#64748b',
    fontFamily: 'Helvetica-Bold'
  },
  footerVerified: {
    fontSize: 5,
    color: '#059669',
    fontFamily: 'Helvetica-Bold'
  }
});

export default function StudentIdCardsPdfDocument({ students, classData, teacher, schoolInfo, academicYear }) {
  const schoolLogo = schoolInfo?.logo_url || schoolInfo?.logo || null;
  const schoolName = schoolInfo?.schoolName || schoolInfo?.name || 'Greenwood International School';
  const className = classData ? `${classData.class_name} - ${classData.section}` : 'N/A';

  const primaryColor = schoolInfo?.primaryColor || schoolInfo?.primary_color || '#4f46e5';
  const bgLight = hexToRgba(primaryColor, 0.08);

  return (
    <Document>
      {students.map((st) => {
        const fullName = `${st.first_name || ''} ${st.last_name || ''}`.trim().toUpperCase() || 'STUDENT NAME';
        const initials = (st.first_name?.charAt(0) || fullName.charAt(0) || 'S').toUpperCase();
        const rawPhoto = st.image_url || st.photo;
        const photoSrc = rawPhoto && typeof rawPhoto === 'string' && !rawPhoto.includes('ui-avatars.com') ? rawPhoto : null;

        return (
          <Page key={st.id} size={[153, 244]} style={styles.page}>
            <View style={styles.card}>
              
              {/* Header */}
              <View style={styles.header}>
                {schoolLogo ? (
                  <Image src={schoolLogo} style={styles.schoolLogo} />
                ) : null}
                <View style={styles.headerTextContainer}>
                  <Text style={styles.schoolName}>{schoolName}</Text>
                  <Text style={[styles.headerSub, { color: primaryColor }]}>Official Student Identity Card</Text>
                </View>
              </View>

              {/* Body Content */}
              <View style={styles.content}>
                <View style={[styles.avatarContainer, { backgroundColor: bgLight, borderColor: hexToRgba(primaryColor, 0.25) }]}>
                  {photoSrc ? (
                    <Image src={photoSrc} style={styles.avatar} />
                  ) : (
                    <Text style={[styles.avatarText, { color: primaryColor }]}>{initials}</Text>
                  )}
                </View>

                <Text style={styles.name}>{fullName}</Text>
                <Text style={[styles.className, { color: primaryColor, backgroundColor: bgLight }]}>{className}</Text>

                {/* Grid info */}
                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Admission No</Text>
                    <Text style={styles.detailValue}>{st.admission_number || `ADM-${st.id}`}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Roll Number</Text>
                    <Text style={styles.detailValue}>{st.rollNumber || st.roll_number || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Date of Birth</Text>
                    <Text style={styles.detailValue}>{st.dob ? new Date(st.dob).toLocaleDateString('en-GB') : 'N/A'}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Gender</Text>
                    <Text style={styles.detailValue}>{(st.gender || 'Male').toUpperCase()}</Text>
                  </View>
                </View>

                {/* Additional Info */}
                <View style={styles.infoSection}>
                  {teacher ? (
                    <View style={[styles.teacherRow, { backgroundColor: bgLight }]}>
                      <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                        <GraduationCapIcon color={primaryColor} />
                        <Text style={[styles.infoTextGreen, { color: primaryColor, marginLeft: 2 }]}>Teacher:</Text>
                      </View>
                      <Text style={styles.infoTextBold}>{teacher.name}</Text>
                    </View>
                  ) : null}

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Guardian:</Text>
                    <Text style={styles.infoValue}>{st.guardian_name || 'N/A'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Contact:</Text>
                    <Text style={styles.infoValue}>{st.guardian_phone || 'N/A'}</Text>
                  </View>
                  <View style={[styles.infoRow, { justifyContent: 'flex-start', alignItems: 'flex-start' }]}>
                    <Text style={[styles.infoLabel, { marginRight: 2 }]}>Address:</Text>
                    <Text style={[styles.infoValue, { flex: 1, textAlign: 'left', lineHeight: 1.15 }]}>{st.guardian_address || st.parent?.address || 'N/A'}</Text>
                  </View>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Session: {academicYear?.year_name || '2026-2027'}</Text>
                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2.5 }}>
                  {st.status === 'active' && <CheckCircleIcon color={primaryColor} />}
                  <Text style={[styles.footerVerified, st.status === 'active' ? { color: primaryColor, marginLeft: 2 } : { color: '#ef4444' }]}>
                    {st.status === 'active' ? 'Verified Badge' : 'Pending'}
                  </Text>
                </View>
              </View>

            </View>
          </Page>
        );
      })}
    </Document>
  );
}
