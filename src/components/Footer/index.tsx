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
        background: 'white',
        opacity: 0.5,
      }}
      copyright={`${currentYear} ${defaultMessage}`}
      links={[
        {
          key: 'www.xleon.site',
          title: 'www.xleon.site',
          href: 'https://www.xleon.site',
          blankTarget: true,
        },
        {
          key: 'github goodnighthsu',
          title: <GithubOutlined />,
          href: 'https://github.com/goodnighthsu',
          blankTarget: true,
        },
        {
          key: '沪ICP备20025051号-1', 
          title: '沪ICP备20025051号-1',
          href: 'https://beian.miit.gov.cn/',
          blankTarget: true,
        },
      ]}
    />
  );
};

export default Footer;
