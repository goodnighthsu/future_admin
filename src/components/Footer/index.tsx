import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';

const Footer: React.FC = () => {
  const intl = useIntl();
  const defaultMessage = intl.formatMessage({
    id: 'app.copyright.produced',
    defaultMessage: 'Power by xleon',
  });

  const currentYear = new Date().getFullYear();

  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      copyright={`${currentYear} ${defaultMessage}`}
      links={[
        {
          key: 'web',
          title: 'www.xleon.site',
          href: 'https://www.xleon.site',
          blankTarget: true,
        },
        {
          key: 'github goodnighthsu',
          title: <GithubOutlined />,
          href: 'https://https://github.com/goodnighthsu',
          blankTarget: true,
        }
      ]}
    />
  );
};

export default Footer;
